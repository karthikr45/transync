import { expect, test } from "@playwright/test";

test.describe("Login", () => {
  test("renders the two account-kind pills and an email/password form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Log on/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Patient/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Provider, Monitor or Admin/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("blank submission shows the browser's required-field validation", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Log on", exact: true }).click();
    // The submit button stays enabled; required attribute prevents network call.
    await expect(page).toHaveURL(/\/login/);
  });
});
