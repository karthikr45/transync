import { NextRequest, NextResponse } from "next/server";
import { callUpstream, extractRefreshedToken } from "@/lib/server-upstream";
import { clearAuthCookies, readRefreshToken, setAccessTokenCookie } from "@/lib/server-auth";
import { csrfCheck } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: NextRequest) {
  const csrf = csrfCheck(req);
  if (csrf) return noStore(NextResponse.json({ statusCode: 403, message: csrf, status: "Failure" }, { status: 403 }));

  const rl = checkRateLimit(req, "auth-refresh", 30, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json({ statusCode: 429, message: "Too many refresh attempts.", status: "Failure" }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSeconds));
    return noStore(res);
  }

  const refresh = readRefreshToken(req);
  if (!refresh) {
    const r = noStore(NextResponse.json({ statusCode: 401, message: "No refresh token.", status: "Failure" }, { status: 401 }));
    clearAuthCookies(r);
    return r;
  }
  const upstream = await callUpstream("/auth/refresh", { method: "POST", token: refresh });
  if (!upstream.ok) {
    const r = noStore(NextResponse.json({ statusCode: 401, message: "Refresh failed.", status: "Failure" }, { status: 401 }));
    clearAuthCookies(r);
    return r;
  }
  const newToken = extractRefreshedToken(upstream.body);
  if (!newToken) {
    const r = noStore(NextResponse.json({ statusCode: 500, message: "Refresh response missing accessToken.", status: "Failure" }, { status: 500 }));
    clearAuthCookies(r);
    return r;
  }
  const response = NextResponse.json({ statusCode: 200, message: "Refreshed.", status: "Success", result: null });
  setAccessTokenCookie(response, newToken);
  return noStore(response);
}
