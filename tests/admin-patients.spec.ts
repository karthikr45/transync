import { expect, test, type Page } from "@playwright/test";
import { patientList } from "../lib/admin-patients";

async function signIn(page: Page, role = "super_admin") {
  await page.addInitScript((role) => {
    localStorage.setItem("tc_kind", "home-care");
    localStorage.setItem("tc_at", "test-admin-token");
    localStorage.setItem("tc_user", JSON.stringify({ role, email: "admin@example.test", firstName: "Test" }));
  }, role);
}

test("patient list preserves nested fields and respects pagination metadata", () => {
  const row = { firstName: "Sample", extra: { enabled: false }, therapy: 0 };
  const list = patientList({ patients: [row], pagination: { total: 26, totalPages: 2 } }, 2, 25);
  expect(list.rows).toEqual([row]);
  expect(list.columns).toContain("extra");
  expect(list.total).toBe(26);
  expect(list.hasNext).toBe(false);
  expect(patientList({ users: Array(25).fill(row) }, 1, 25).hasNext).toBe(true);
  expect(patientList({ users: [] }, 2, 25).hasNext).toBe(false);
  expect(patientList({ unexpected: row }, 1, 25).rows).toBeNull();
});

test("super admin can view details, request page 2, and change page size", async ({ page }) => {
  await signIn(page);
  const requests: string[] = [];
  await page.route("**/home-care/admin/patients?*", async (route) => {
    const req = route.request();
    expect(req.headers().authorization).toBe("Bearer test-admin-token");
    const url = new URL(req.url());
    requests.push(url.search);
    const current = Number(url.searchParams.get("page"));
    await route.fulfill({ json: { status: "Success", result: {
      patients: [{ id: `patient-${current}`, firstName: current === 1 ? "Alice" : "Bob", device: { serial: "TEST-123" } }],
      total: 26, totalPages: Math.ceil(26 / Number(url.searchParams.get("limit"))),
    } } });
  });
  await page.goto("/admin/patients");
  await expect(page.getByRole("link", { name: "Patients", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Alice", exact: true })).toBeVisible();
  await page.getByText("View details", { exact: true }).click();
  await expect(page.getByRole("cell").filter({ hasText: "TEST-123" })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("cell", { name: "Bob", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  expect(requests).toContain("?page=2&limit=25");
  await page.getByLabel("Patients per page").selectOption("50");
  await expect(page.getByRole("cell", { name: "Alice", exact: true })).toBeVisible();
  expect(requests).toContain("?page=1&limit=50");
});

test("patients API errors support retry and empty results", async ({ page }) => {
  await signIn(page);
  let fail = true;
  await page.route("**/home-care/admin/patients?*", (route) => route.fulfill(fail
    ? { status: 403, json: { message: "Super admin access required" } }
    : { json: { status: "Success", result: { patients: [], total: 0 } } }));
  await page.goto("/admin/patients");
  await expect(page.getByRole("alert").filter({ hasText: "Super admin access required" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  fail = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByText("No patients found on this page.")).toBeVisible();
});

test("non-admin accounts cannot open the patients page or fetch its data", async ({ page }) => {
  await signIn(page, "user");
  let called = false;
  await page.route("**/home-care/admin/patients?*", (route) => { called = true; return route.abort(); });
  await page.goto("/admin/patients");
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(called).toBe(false);
});
