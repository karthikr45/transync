// Client-side session helpers. Tokens live in httpOnly cookies and are
// never readable here. We only read the user-profile / kind cookies,
// which are written server-side after a successful login.

import type { AccountUser, EndUser } from "./types.api";

export type UserKind = "home-care" | "end-user";

const COOKIE_USER = "tc_user";
const COOKIE_KIND = "tc_kind";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const p of parts) {
    if (p.startsWith(prefix)) return decodeURIComponent(p.slice(prefix.length));
  }
  return null;
}

export function getUserKind(): UserKind | null {
  const v = readCookie(COOKIE_KIND);
  return v === "home-care" || v === "end-user" ? v : null;
}

export function getCurrentUser(): AccountUser | null {
  if (getUserKind() !== "home-care") return null;
  const raw = readCookie(COOKIE_USER);
  if (!raw) return null;
  try { return JSON.parse(raw) as AccountUser; } catch { return null; }
}

export function getCurrentEndUser(): EndUser | null {
  if (getUserKind() !== "end-user") return null;
  const raw = readCookie(COOKIE_USER);
  if (!raw) return null;
  try { return JSON.parse(raw) as EndUser; } catch { return null; }
}

export function destinationForUser(user: AccountUser): string {
  if (user.role === "super_admin") return "/admin/dashboard";
  if (user.userType === "home_care_provider") return "/provider/dashboard";
  return "/monitor/dashboard"; // authorized_monitor
}

export async function logout(): Promise<void> {
  try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}
