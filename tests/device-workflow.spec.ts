import { test, expect, type Page } from "@playwright/test";
import { parseSerials, type Permission, type WorkflowRow } from "../lib/device-workflow";

const root = "/home-care/device-management/";
const future = () => new Date(Date.now() + 600_000).toISOString();
async function session(page: Page, admin: boolean) {
  await page.addInitScript((admin) => {
    localStorage.setItem("tc_kind", "home-care");
    localStorage.setItem("tc_at", "fixture-token");
    localStorage.setItem(
      "tc_user",
      JSON.stringify({
        role: admin ? "super_admin" : "user",
        userType: "home_care_provider",
        status: "approved",
        email: "fixture@example.test",
      }),
    );
  }, admin);
}
async function api(
  page: Page,
  permissions: Permission[],
  rows: Record<string, WorkflowRow[]> = {},
) {
  const writes: { path: string; body: Record<string, unknown>; key?: string }[] = [];
  await page.route("**/home-care/device-management/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.split(root)[1];
    expect(req.headers().authorization).toBe("Bearer fixture-token");
    if (req.method() === "POST") {
      const body = req.postDataJSON();
      writes.push({ path, body, key: req.headers()["idempotency-key"] });
      if (path === "claim-checks")
        return route.fulfill({
          json: {
            validationId: "v1",
            expiresAt: future(),
            results: body.serials.map((serial: string) => ({
              serial,
              outcome: serial === "NEEDS-REVIEW" ? "approval_required" : "eligible",
              message: "Verified",
            })),
          },
        });
      return route.fulfill({
        json: {
          message: "Action confirmed.",
          ...(path === "claims"
            ? {
                results: body.serials.map((serial: string) => ({
                  serial,
                  outcome: "claimed",
                  message: "Added to inventory",
                })),
              }
            : {}),
        },
      });
    }
    if (path === "context")
      return route.fulfill({ json: { contractVersion: 1, organizationId: "org1", permissions } });
    const items =
      path === "organizations"
        ? [{ id: "org2", name: "Approved HCP" }]
        : path === "patients"
          ? [{ id: "patient1", name: "Patient Example" }]
          : (rows[path] ?? []);
    return route.fulfill({
      json: {
        items,
        page: Number(url.searchParams.get("page") || 1),
        limit: Number(url.searchParams.get("limit") || 25),
        total: items.length,
      },
    });
  });
  return writes;
}

test("serial batches are deduplicated without changing manufacturer case", () => {
  expect(parseSerials("Ab-1, Ab-1; ab-1\nAB-2")).toEqual({
    serials: ["Ab-1", "ab-1", "AB-2"],
    duplicates: 1,
  });
  expect(() => parseSerials(" \n ")).toThrow("at least one");
  expect(() => parseSerials(Array.from({ length: 101 }, (_, n) => `S${n}`).join("\n"))).toThrow(
    "100",
  );
});

test("HCP verification precedes claiming and never calls the legacy route", async ({ page }) => {
  await session(page, false);
  const writes = await api(page, ["claims:write"]);
  let legacy = false;
  await page.route("**/home-care/devices/upload", (route) => {
    legacy = true;
    return route.abort();
  });
  await page.goto("/provider/devices/claim");
  await page.getByLabel("Device serials", { exact: true }).fill("TEST-1\nTEST-1");
  await page.getByRole("button", { name: "Verify serials", exact: true }).click();
  await expect(page.getByRole("button", { name: "Claim 1 eligible devices" })).toBeVisible();
  expect(writes.map((w) => w.path)).toEqual(["claim-checks"]);
  await page.getByRole("button", { name: "Claim 1 eligible devices" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes[1].body).toEqual({ serials: ["TEST-1"], validationId: "v1" });
  expect(writes[1].key).toBeTruthy();
  expect(legacy).toBe(false);
});

test("editing serials invalidates earlier verification", async ({ page }) => {
  await session(page, false);
  await api(page, ["claims:write"]);
  await page.goto("/provider/devices/claim");
  await page.getByLabel("Device serials", { exact: true }).fill("TEST-1");
  await page.getByRole("button", { name: "Verify serials", exact: true }).click();
  await expect(page.getByRole("button", { name: "Claim 1 eligible devices" })).toBeVisible();
  await page.getByLabel("Device serials", { exact: true }).fill("OTHER-1");
  await expect(page.getByRole("button", { name: "Claim 1 eligible devices" })).toHaveCount(0);
});

test("unallocated device creates a pending request rather than a claim", async ({ page }) => {
  await session(page, false);
  const writes = await api(page, ["claims:write"]);
  await page.goto("/provider/devices/claim");
  await page.getByLabel("Device serials", { exact: true }).fill("NEEDS-REVIEW");
  await page.getByRole("button", { name: "Verify serials", exact: true }).click();
  await page.getByLabel("Order / shipment reference").fill("ORDER-1");
  await page.getByLabel("Reason", { exact: true }).fill("Device supplied with our order.");
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes.map((w) => w.path)).toEqual(["claim-checks", "claim-requests"]);
});

test("super admin registers a batch and allocates it to an approved HCP", async ({ page }) => {
  await session(page, true);
  const writes = await api(page, ["registry:write", "allocations:write"]);
  await page.goto("/admin/devices");
  await page.getByRole("button", { name: "Register devices", exact: true }).click();
  let form = page.getByRole("form", { name: "Register devices" });
  await form.getByLabel("Device serials").fill("TEST-1\nTEST-2");
  await form.getByLabel("Model", { exact: true }).fill("Example model");
  await form.getByLabel("Manufacturing reference").fill("LOT-1");
  await form.getByLabel("Reason", { exact: true }).fill("Verified manufacturing batch");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Register devices", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes[0].body.devices).toEqual([
    { serial: "TEST-1", model: "Example model" },
    { serial: "TEST-2", model: "Example model" },
  ]);
  await page.goto("/admin/allocations");
  await page.getByRole("button", { name: "Allocate devices", exact: true }).click();
  form = page.getByRole("form", { name: "Allocate devices" });
  await form.getByLabel("Device serials").fill("TEST-1");
  await expect(form.getByLabel("Approved HCP", { exact: true })).toBeEnabled();
  await form.getByLabel("Approved HCP", { exact: true }).selectOption("org2");
  await form.getByLabel("Order / shipment reference").fill("ORDER-1");
  await form.getByLabel("Reason", { exact: true }).fill("Shipment allocation");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Allocate devices", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes[1].body.organizationId).toBe("org2");
});

test("claim review requires a reason and records the decision", async ({ page }) => {
  await session(page, true);
  const writes = await api(page, ["claims:review"], {
    "claim-requests": [
      {
        id: "request1",
        serials: ["TEST-1"],
        status: "pending",
        allowedActions: ["approve", "reject"],
      },
    ],
  });
  await page.goto("/admin/claim-requests");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  const form = page.getByRole("form", { name: "Approve request" });
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Approve request", exact: true }).click();
  expect(writes).toHaveLength(0);
  await form.getByLabel("Reason", { exact: true }).fill("Order evidence checked");
  await form.getByRole("button", { name: "Approve request", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes[0]).toMatchObject({
    path: "claim-requests/request1/review",
    body: { decision: "approved", reason: "Order evidence checked" },
  });
});

test("HCP can assign an eligible patient to inventory", async ({ page }) => {
  await session(page, false);
  const writes = await api(page, ["assignments:write"], {
    inventory: [{ id: "d1", serial: "TEST-1", status: "claimed", allowedActions: ["assign"] }],
  });
  await page.goto("/provider/devices");
  await page.getByRole("button", { name: "Assign", exact: true }).click();
  const form = page.getByRole("form", { name: "Assign patient" });
  await expect(form.getByLabel("Patient", { exact: true })).toBeEnabled();
  await form.getByLabel("Patient", { exact: true }).selectOption("patient1");
  await form.getByLabel("Effective date and time", { exact: false }).fill("2026-09-24T10:00");
  await form.getByLabel("Reason", { exact: true }).fill("Patient setup completed");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Assign patient", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes[0].path).toBe("inventory/d1/assignment");
  expect(writes[0].body.patientId).toBe("patient1");
});

test("transfer actions follow server allowed actions and user permissions", async ({ page }) => {
  await session(page, false);
  const writes = await api(page, ["transfers:write"], {
    transfers: [
      { id: "t1", serial: "TEST-1", status: "pending_release", allowedActions: ["release"] },
    ],
  });
  await page.goto("/provider/transfers");
  await expect(page.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Release", exact: true }).click();
  const form = page.getByRole("form", { name: "Release for transfer" });
  await form.getByLabel("Reason", { exact: true }).fill("Released for destination provider");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Release for transfer", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Action confirmed" })).toBeVisible();
  expect(writes[0].path).toBe("transfers/t1/release");
});

test("unavailable backend does not simulate success or expose claim controls", async ({ page }) => {
  await session(page, false);
  await page.route("**/home-care/device-management/context", (route) =>
    route.fulfill({ status: 404, json: { message: "Not found" } }),
  );
  await page.goto("/provider/devices/claim");
  await expect(page.getByRole("alert").filter({ hasText: "not available yet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify serials", exact: true })).toHaveCount(0);
});

test("read-only HCP cannot use claim controls", async ({ page }) => {
  await session(page, false);
  await api(page, []);
  await page.goto("/provider/devices/claim");
  await expect(
    page.getByRole("alert").filter({ hasText: "Only authorized organization administrators" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify serials", exact: true })).toHaveCount(0);
});

test("expired verification never enables claiming", async ({ page }) => {
  await session(page, false);
  await api(page, ["claims:write"]);
  await page.route("**/home-care/device-management/claim-checks", (route) =>
    route.fulfill({
      json: {
        validationId: "expired",
        expiresAt: "2020-01-01T00:00:00Z",
        results: [{ serial: "TEST-1", outcome: "eligible", message: "Old allocation" }],
      },
    }),
  );
  await page.goto("/provider/devices/claim");
  await page.getByLabel("Device serials", { exact: true }).fill("TEST-1");
  await page.getByRole("button", { name: "Verify serials", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Please verify again" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Claim 1 eligible devices" })).toHaveCount(0);
});

test("claim conflicts clear the old verification", async ({ page }) => {
  await session(page, false);
  await api(page, ["claims:write"]);
  await page.route("**/home-care/device-management/claims", (route) =>
    route.fulfill({ status: 409, json: { message: "Allocation changed" } }),
  );
  await page.goto("/provider/devices/claim");
  await page.getByLabel("Device serials", { exact: true }).fill("TEST-1");
  await page.getByRole("button", { name: "Verify serials", exact: true }).click();
  await page.getByRole("button", { name: "Claim 1 eligible devices" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "has changed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Claim 1 eligible devices" })).toHaveCount(0);
});
