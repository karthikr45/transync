import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const session = vi.hoisted(() => ({
  token: "old" as string | null,
  refresh: "refresh" as string | null,
}));
vi.mock("@/lib/env", () => ({ API_BASE_URL: "https://api.example.test" }));
vi.mock("@/lib/auth", () => ({
  getToken: () => session.token,
  getRefreshToken: () => session.refresh,
  getUserKind: () => "home-care",
  getCurrentUser: () => ({ id: "user" }),
  getCurrentEndUser: () => null,
  setSession: (token: string, refresh: string) => Object.assign(session, { token, refresh }),
  clearSession: () => Object.assign(session, { token: null, refresh: null }),
}));
import { apiFetch } from "@/lib/http/client";
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
beforeEach(() => Object.assign(session, { token: "old", refresh: "refresh" }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("authenticated transport", () => {
  it("shares one refresh between simultaneous unauthorized requests", async () => {
    let refreshes = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.endsWith("/auth/refresh")) {
          refreshes++;
          await new Promise((r) => setTimeout(r, 5));
          return json({ accessToken: "new" });
        }
        return new Headers(init.headers).get("Authorization") === "Bearer new"
          ? json({ id: "ok" })
          : json({}, 401);
      }),
    );
    const results = await Promise.all([apiFetch("/a"), apiFetch("/b")]);
    expect(results).toEqual([{ id: "ok" }, { id: "ok" }]);
    expect(refreshes).toBe(1);
  });
  it("cannot restore a session after logout during refresh", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/auth/refresh")) {
          session.token = null;
          session.refresh = null;
          return json({ accessToken: "new" });
        }
        return json({}, 401);
      }),
    );
    await expect(apiFetch("/a", { _skipAuthRedirect: true })).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(session.token).toBeNull();
  });
  it("does not refresh public authentication failures", async () => {
    const fetcher = vi.fn(async () => json({ message: "Invalid login" }, 401));
    vi.stubGlobal("fetch", fetcher);
    await expect(apiFetch("/auth/login", { _skipAuth: true })).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(session.token).toBe("old");
  });
  it("times out a stalled request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) =>
            init.signal?.addEventListener("abort", () => reject(init.signal?.reason)),
          ),
      ),
    );
    await expect(apiFetch("/a", { timeoutMs: 5 })).rejects.toThrow("timed out");
  });
});
