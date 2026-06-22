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
      await page.goto(path);
      // AuthGuard runs in a useEffect; wait for the redirect.
      await page.waitForURL(/\/login\?next=/);
      expect(page.url()).toContain(encodeURIComponent(path));
    });
  }
});

test.describe("Security headers", () => {
  test("Landing page sets HSTS, X-Frame-Options, CSP and friends", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("default-src 'self'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
  });
});
