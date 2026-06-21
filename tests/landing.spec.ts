import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders the three account-type cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /CPAP compliance/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Homecare Provider" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Authorized Monitor" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Individual User" })).toBeVisible();
  });

  test("Log on button goes to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Log on/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
