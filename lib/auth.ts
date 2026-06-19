import type { AccountUser } from "./types.api";

const TOKEN_KEY = "transcend.token";
const REFRESH_KEY = "transcend.refreshToken";
const USER_KEY = "transcend.user";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function setSession(token: string, refreshToken: string, user: AccountUser): void {
  const s = storage();
  if (!s) return;
  s.setItem(TOKEN_KEY, token);
  s.setItem(REFRESH_KEY, refreshToken);
  s.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(TOKEN_KEY);
  s.removeItem(REFRESH_KEY);
  s.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function getCurrentUser(): AccountUser | null {
  const raw = storage()?.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AccountUser;
  } catch {
    return null;
  }
}

export function destinationForUser(user: AccountUser): string {
  if (user.role === "super_admin") return "/admin/dashboard";
  if (user.userType === "home_care_provider") return "/provider/dashboard";
  return "/monitor/dashboard"; // authorized_monitor
}
