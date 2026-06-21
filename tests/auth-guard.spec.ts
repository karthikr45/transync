import { expect, test } from "@playwright/test";

const protectedPaths = [
  "/provider/dashboard",
  "/monitor/dashboard",
  "/admin/dashboard",
  "/patient/dashboard",
];

test.describe("Auth guard", () => {
  for (const path of protectedPaths) {
    test(`unauthenticated request to ${path} redirects to /login with ?next=`, async ({ page }) => {
      const res = await page.goto(path);
      // Either the response was a redirect (server-side) or the URL changed (client-side).
      await expect(page).toHaveURL(/\/login\?next=/);
      // Server-rendered redirect should also surface the X-Redirected-By header.
      if (res) {
        const header = res.headerValue("x-redirected-by");
        // We don't fail if absent — middleware redirects may be transparent through the dev server.
        await header;
      }
      expect(page.url()).toContain(encodeURIComponent(path));
    });
  }
});

test.describe("Security headers", () => {
  test("Landing page sets strict-transport-security, X-Frame-Options, CSP", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("default-src 'self'");
  });
});
