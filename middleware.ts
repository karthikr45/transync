// Auth gate. Reads the access-token cookie (httpOnly) and the user-kind
// cookie. If unauthenticated, redirects to /login with a ?next= back-link.
// If logged in to the wrong portal, sends the user to /login so they can
// pick the right account type.

import { NextRequest, NextResponse } from "next/server";

const COOKIE_AT = "tc_at";
const COOKIE_KIND = "tc_kind";
const COOKIE_USER = "tc_user";

type SessionKind = "home-care" | "end-user";

type UserInfo = { role?: string; userType?: string };

function readUser(value: string | undefined): UserInfo | undefined {
  if (!value) return undefined;
  try { return JSON.parse(value) as UserInfo; } catch { return undefined; }
}

function redirectToLogin(req: NextRequest) {
  const next = req.nextUrl.pathname + req.nextUrl.search;
  const url = new URL("/login", req.url);
  url.searchParams.set("next", next);
  const res = NextResponse.redirect(url);
  res.headers.set("x-redirected-by", "auth-middleware");
  return res;
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const at = req.cookies.get(COOKIE_AT)?.value;
  const kind = req.cookies.get(COOKIE_KIND)?.value as SessionKind | undefined;
  const user = readUser(req.cookies.get(COOKIE_USER)?.value);

  if (!at || !kind) return redirectToLogin(req);

  if (path.startsWith("/admin")) {
    if (kind !== "home-care" || user?.role !== "super_admin") return redirectToLogin(req);
  } else if (path.startsWith("/provider")) {
    if (kind !== "home-care" || user?.userType !== "home_care_provider") return redirectToLogin(req);
  } else if (path.startsWith("/monitor")) {
    if (kind !== "home-care" || user?.userType !== "authorized_monitor") return redirectToLogin(req);
  } else if (path.startsWith("/patient")) {
    if (kind !== "end-user") return redirectToLogin(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/provider/:path*",
    "/monitor/:path*",
    "/admin/:path*",
    "/patient/:path*",
  ],
};
