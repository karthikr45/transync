import { expect, test } from "@playwright/test";

test.describe("Registration", () => {
  test("type picker shows three account types and gates Continue", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /Account Registration/i })).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /Continue Registration/i });
    await expect(continueBtn).toBeDisabled();
    await page.getByText(/Homecare Provider Account/i).click();
    await expect(continueBtn).toBeEnabled();
  });

  test("Continue with Homecare Provider opens the two-column Account Information form", async ({ page }) => {
    await page.goto("/register");
    await page.getByText(/Homecare Provider Account/i).click();
    await page.getByRole("button", { name: /Continue Registration/i }).click();
    await expect(page.getByText("Corporate Information")).toBeVisible();
    await expect(page.getByText("User Information").first()).toBeVisible();
  });

  test("Continue with Individual User routes to /register/patient (OTP flow)", async ({ page }) => {
    await page.goto("/register");
    await page.getByText(/Individual User Account/i).click();
    await page.getByRole("button", { name: /Continue Registration/i }).click();
    await expect(page).toHaveURL(/\/register\/patient/);
    await expect(page.getByRole("button", { name: /Send code/i })).toBeVisible();
  });
});
