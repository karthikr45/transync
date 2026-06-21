// Server-only cookie helpers. Tokens live in httpOnly cookies so they
// are not reachable from JavaScript. User profile and account kind live
// in non-httpOnly cookies so the client can render the portal shell and
// route correctly.

import type { NextResponse, NextRequest } from "next/server";
import type { AccountUser, EndUser } from "./types.api";

const isProd = process.env.NODE_ENV === "production";

export const COOKIE_AT = "tc_at";       // access token (httpOnly)
export const COOKIE_RT = "tc_rt";       // refresh token (httpOnly)
export const COOKIE_USER = "tc_user";   // user profile (NOT httpOnly)
export const COOKIE_KIND = "tc_kind";   // "home-care" | "end-user" (NOT httpOnly)

const ACCESS_MAX_AGE = 60 * 60;            // 1 hour
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;  // 7 days

const httpOnlyOpts = {
  httpOnly: true as const,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

const clientReadable = {
  httpOnly: false as const,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

export type SessionKind = "home-care" | "end-user";

export function setAuthCookies(
  response: NextResponse,
  args: { token: string; refreshToken: string; user: unknown; kind: SessionKind },
): void {
  response.cookies.set(COOKIE_AT, args.token, { ...httpOnlyOpts, maxAge: ACCESS_MAX_AGE });
  response.cookies.set(COOKIE_RT, args.refreshToken, { ...httpOnlyOpts, maxAge: REFRESH_MAX_AGE });
  response.cookies.set(COOKIE_USER, JSON.stringify(args.user), { ...clientReadable, maxAge: REFRESH_MAX_AGE });
  response.cookies.set(COOKIE_KIND, args.kind, { ...clientReadable, maxAge: REFRESH_MAX_AGE });
}

export function setAccessTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_AT, token, { ...httpOnlyOpts, maxAge: ACCESS_MAX_AGE });
}

export function clearAuthCookies(response: NextResponse): void {
  for (const name of [COOKIE_AT, COOKIE_RT, COOKIE_USER, COOKIE_KIND]) {
    response.cookies.set(name, "", { ...httpOnlyOpts, maxAge: 0 });
    response.cookies.set(name, "", { ...clientReadable, maxAge: 0 });
  }
}

export function readAccessToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_AT)?.value;
}

export function readRefreshToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_RT)?.value;
}

export function readKind(req: NextRequest): SessionKind | undefined {
  const v = req.cookies.get(COOKIE_KIND)?.value;
  return v === "home-care" || v === "end-user" ? v : undefined;
}

export function readUser(req: NextRequest): AccountUser | EndUser | undefined {
  const v = req.cookies.get(COOKIE_USER)?.value;
  if (!v) return undefined;
  try {
    return JSON.parse(v) as AccountUser | EndUser;
  } catch {
    return undefined;
  }
}
