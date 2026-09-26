import { expect, test, type Page } from "@playwright/test";
import type { MetadataDocument } from "../features/admin/metadata/schemas";

const record: MetadataDocument = {
  _id: "metadata-1",
  occupation: [
    { label: "Engineer", value: 7 },
    { label: "Retired", value: 42 },
  ],
  userExpList: [{ label: "New user", value: 5 }],
  devicePurposeList: [{ label: "Travel", value: 11 }],
  devicePurchaseList: [{ label: "Provider", value: 30 }],
  clinicalMode: { delayTime: "9000", disable: true, extra: "keep" },
  appUpdate: { forceUpdate: false, rm: true },
  verbiage: { welcome: "Hello" },
  showPopUp: true,
  gender: ["Other"],
};
async function signIn(page: Page, role = "super_admin") {
  await page.addInitScript((role) => {
    localStorage.setItem("tc_kind", "home-care");
    localStorage.setItem("tc_at", "metadata-test-token");
    localStorage.setItem(
      "tc_user",
      JSON.stringify({ role, email: "admin@example.test", firstName: "Test" }),
    );
  }, role);
}
async function mockMetadata(page: Page, initial: MetadataDocument | null = record) {
  let data = structuredClone(initial);
  const writes: { method: string; path: string; body: Record<string, unknown> | null }[] = [];
  await page.route(
    (url) => url.pathname === "/metadata" || url.pathname.startsWith("/metadata/"),
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      expect(request.headers().authorization).toBe("Bearer metadata-test-token");
      if (request.method() === "GET") {
        await route.fulfill({ json: { status: "Success", result: data } });
        return;
      }
      const body = request.postData() ? (request.postDataJSON() as Record<string, unknown>) : null;
      writes.push({ method: request.method(), path, body });
      if (request.method() === "DELETE") data = null;
      else data = { ...data, ...body, _id: data?._id ?? "created-1" };
      await route.fulfill({ json: { status: "Success", result: data } });
    },
  );
  return {
    writes,
    setData: (next: MetadataDocument | null) => {
      data = structuredClone(next);
    },
  };
}

test("metadata section edits preserve option values and unrelated settings", async ({ page }) => {
  await signIn(page);
  const api = await mockMetadata(page);
  await page.goto("/admin/metadata");
  await expect(page.getByRole("link", { name: "Metadata", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Occupation", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Edit Occupation", exact: true })).toBeFocused();
  await page.getByLabel("Occupation option 1", { exact: true }).fill("Engineering");
  await page.getByRole("button", { name: "Remove Occupation option 2", exact: true }).click();
  await page.getByRole("button", { name: "Add occupation option", exact: true }).click();
  await page.getByLabel("Occupation option 2", { exact: true }).fill("Teacher");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Metadata updated." })).toHaveText(
    "Metadata updated.",
  );
  expect(api.writes).toHaveLength(1);
  expect(api.writes[0].method).toBe("PATCH");
  expect(api.writes[0].body?.occupation).toEqual([
    { label: "Engineering", value: 7 },
    { label: "Teacher", value: 43 },
  ]);
  expect(api.writes[0].body?.appUpdate).toEqual(record.appUpdate);
  expect(api.writes[0].body?.clinicalMode).toEqual(record.clinicalMode);
  expect(api.writes[0].body?.verbiage).toEqual(record.verbiage);
  await expect(page.getByText("Teacher", { exact: true })).toBeVisible();
});
test("metadata create and explicit delete confirmation work", async ({ page }) => {
  await signIn(page);
  const api = await mockMetadata(page, null);
  await page.goto("/admin/metadata");
  await page.getByRole("button", { name: "Create metadata", exact: true }).click();
  for (const [label, value] of [
    ["Occupation", "Teacher"],
    ["CPAP experience", "New"],
    ["Device usage", "Travel"],
    ["Purchase source", "Provider"],
  ])
    await page.getByLabel(`${label} option 1`, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Create metadata", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Metadata created." })).toHaveText(
    "Metadata created.",
  );
  expect(api.writes[0].path).toBe("/metadata/save");
  expect(api.writes[0].body?.occupation).toEqual([{ label: "Teacher", value: 0 }]);
  await page.getByRole("button", { name: "Delete metadata", exact: true }).click();
  const remove = page.getByRole("button", { name: "Delete metadata permanently", exact: true });
  await expect(remove).toBeDisabled();
  await page.getByLabel("Delete confirmation", { exact: true }).fill("DELETE");
  await remove.click();
  await expect(page.getByRole("heading", { name: "No metadata yet", exact: true })).toBeVisible();
  expect(api.writes).toHaveLength(2);
  expect(api.writes[1].method).toBe("DELETE");
});
test("stale metadata cannot overwrite a teammate's changes", async ({ page }) => {
  await signIn(page);
  const api = await mockMetadata(page);
  await page.goto("/admin/metadata");
  await page.getByRole("button", { name: "Edit Occupation", exact: true }).click();
  await page.getByLabel("Occupation option 1", { exact: true }).fill("Renamed");
  api.setData({ ...record, showPopUp: false });
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "changed since you opened" }),
  ).toContainText("changed since you opened");
  expect(api.writes).toHaveLength(0);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Refresh metadata", exact: true }).click();
  await expect(page.getByRole("button", { name: "Update metadata", exact: true })).toBeEnabled();
});
test("missing ID is read-only and malformed responses support retry", async ({ page }) => {
  await signIn(page);
  let malformed = true;
  await page.route(
    (url) => url.pathname === "/metadata",
    (route) =>
      route.fulfill({
        json: {
          status: "Success",
          result: malformed ? { occupation: 7 } : { occupation: ["Other"] },
        },
      }),
  );
  await page.goto("/admin/metadata");
  await expect(page.getByRole("alert").filter({ hasText: "invalid metadata" })).toContainText(
    "invalid metadata",
  );
  await expect(page.getByRole("button", { name: "Create metadata", exact: true })).toHaveCount(0);
  malformed = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "no identifier" })).toContainText(
    "no identifier",
  );
  await expect(page.getByRole("button", { name: "Update metadata", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Delete metadata", exact: true })).toBeDisabled();
});
test("ambiguous save failure keeps the form and prevents blind retry", async ({ page }) => {
  await signIn(page);
  let writes = 0;
  await page.route(
    (url) => url.pathname === "/metadata" || url.pathname.startsWith("/metadata/"),
    async (route) => {
      if (route.request().method() === "GET")
        await route.fulfill({ json: { status: "Success", result: record } });
      else {
        writes++;
        await route.fulfill({ status: 503, json: { message: "Unavailable" } });
      }
    },
  );
  await page.goto("/admin/metadata");
  await page.getByRole("button", { name: "Edit Occupation", exact: true }).click();
  await page.getByLabel("Occupation option 1", { exact: true }).fill("Renamed");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "could not be confirmed" })).toContainText(
    "could not be confirmed",
  );
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeEnabled();
  expect(writes).toBe(1);
});
test("metadata network errors do not offer unsafe creation", async ({ page }) => {
  await signIn(page);
  await page.route(
    (url) => url.pathname === "/metadata",
    (route) => route.fulfill({ status: 404, json: { message: "Endpoint unavailable" } }),
  );
  await page.goto("/admin/metadata");
  await expect(page.getByRole("alert").filter({ hasText: "Endpoint unavailable" })).toContainText(
    "Endpoint unavailable",
  );
  await expect(page.getByRole("button", { name: "Create metadata", exact: true })).toHaveCount(0);
});
test("non-admin users cannot mount metadata tools or call the metadata API", async ({ page }) => {
  await signIn(page, "user");
  let reads = 0;
  await page.route(
    (url) => url.pathname === "/metadata",
    async (route) => {
      reads++;
      await route.fulfill({ json: { status: "Success", result: record } });
    },
  );
  await page.goto("/admin/metadata");
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(reads).toBe(0);
});

test("forbidden metadata writes keep edits available without reporting success", async ({
  page,
}) => {
  await signIn(page);
  await page.route(
    (url) => url.pathname === "/metadata" || url.pathname.startsWith("/metadata/"),
    (route) =>
      route.fulfill(
        route.request().method() === "GET"
          ? { json: { status: "Success", result: record } }
          : { status: 403, json: { message: "Super admin permission required" } },
      ),
  );
  await page.goto("/admin/metadata");
  await page.getByRole("button", { name: "Edit clinical mode", exact: true }).click();
  await page.getByLabel("Clinical mode enabled", { exact: true }).check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Super admin permission required" }),
  ).toHaveText("Super admin permission required");
  await expect(page.getByLabel("Clinical mode enabled", { exact: true })).toBeChecked();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeEnabled();
  await expect(page.getByText("Metadata updated.", { exact: true })).toHaveCount(0);
});

test("metadata editing fits a narrow viewport and uses keyboard-accessible fields", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await mockMetadata(page);
  await page.goto("/admin/metadata");
  await page.getByRole("button", { name: "Edit Occupation", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Edit Occupation", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Occupation option 1", { exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeVisible();
  await testInfo.attach("metadata-editor-mobile", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});
