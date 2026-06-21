import { NextRequest, NextResponse } from "next/server";
import { callUpstream, extractRefreshedToken } from "@/lib/server-upstream";
import { clearAuthCookies, readRefreshToken, setAccessTokenCookie } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const refresh = readRefreshToken(req);
  if (!refresh) {
    const r = NextResponse.json({ statusCode: 401, message: "No refresh token.", status: "Failure" }, { status: 401 });
    clearAuthCookies(r);
    return r;
  }
  const upstream = await callUpstream("/auth/refresh", { method: "POST", token: refresh });
  if (!upstream.ok) {
    const r = NextResponse.json({ statusCode: 401, message: "Refresh failed.", status: "Failure" }, { status: 401 });
    clearAuthCookies(r);
    return r;
  }
  const newToken = extractRefreshedToken(upstream.body);
  if (!newToken) {
    const r = NextResponse.json({ statusCode: 500, message: "Refresh response missing accessToken.", status: "Failure" }, { status: 500 });
    clearAuthCookies(r);
    return r;
  }
  const response = NextResponse.json({ statusCode: 200, message: "Refreshed.", status: "Success", result: null });
  setAccessTokenCookie(response, newToken);
  return response;
}
