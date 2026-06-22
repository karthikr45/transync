// Client session storage. Tokens are kept in localStorage and sent as
// Bearer headers by lib/api.ts. Note: localStorage is reachable by any
// script on the page — keep your CSP tight and never inject untrusted
// HTML to mitigate XSS-token-theft.

import type { AccountUser, EndUser } from "./types.api";

export type UserKind = "home-care" | "end-user";

const TOKEN_KEY = "tc_at";
const REFRESH_KEY = "tc_rt";
const USER_KEY = "tc_user";
const KIND_KEY = "tc_kind";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function setSession(
  token: string,
  refreshToken: string,
  user: AccountUser | EndUser,
  kind: UserKind,
): void {
  const s = storage();
  if (!s) return;
  s.setItem(TOKEN_KEY, token);
  s.setItem(REFRESH_KEY, refreshToken);
  s.setItem(USER_KEY, JSON.stringify(user));
  s.setItem(KIND_KEY, kind);
}

export function clearSession(): void {
  const s = storage();
  if (!s) return;
  for (const k of [TOKEN_KEY, REFRESH_KEY, USER_KEY, KIND_KEY]) s.removeItem(k);
}

export function getToken(): string | null {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_KEY) ?? null;
}

export function getUserKind(): UserKind | null {
  const v = storage()?.getItem(KIND_KEY);
  return v === "home-care" || v === "end-user" ? v : null;
}

export function getCurrentUser(): AccountUser | null {
  if (getUserKind() !== "home-care") return null;
  const raw = storage()?.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AccountUser; } catch { return null; }
}

export function getCurrentEndUser(): EndUser | null {
  if (getUserKind() !== "end-user") return null;
  const raw = storage()?.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as EndUser; } catch { return null; }
}

export function destinationForUser(user: AccountUser): string {
  if (user.role === "super_admin") return "/admin/dashboard";
  if (user.userType === "home_care_provider") return "/provider/dashboard";
  return "/monitor/dashboard";
}

export function logout(): void {
  clearSession();
  if (typeof window !== "undefined") window.location.assign("/login");
}
