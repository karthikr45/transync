import type { AccountUser, EndUser } from "./types.api";

const TOKEN_KEY = "transcend.token";
const REFRESH_KEY = "transcend.refreshToken";
const USER_KEY = "transcend.user";
const KIND_KEY = "transcend.userKind";

export type UserKind = "home-care" | "end-user";

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
  s.removeItem(TOKEN_KEY);
  s.removeItem(REFRESH_KEY);
  s.removeItem(USER_KEY);
  s.removeItem(KIND_KEY);
}

export function getToken(): string | null {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function getUserKind(): UserKind | null {
  const v = storage()?.getItem(KIND_KEY);
  return v === "home-care" || v === "end-user" ? v : null;
}

export function getCurrentUser(): AccountUser | null {
  if (getUserKind() !== "home-care") return null;
  const raw = storage()?.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AccountUser;
  } catch {
    return null;
  }
}

export function getCurrentEndUser(): EndUser | null {
  if (getUserKind() !== "end-user") return null;
  const raw = storage()?.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EndUser;
  } catch {
    return null;
  }
}

export function destinationForUser(user: AccountUser): string {
  if (user.role === "super_admin") return "/admin/dashboard";
  if (user.userType === "home_care_provider") return "/provider/dashboard";
  return "/monitor/dashboard"; // authorized_monitor
}
