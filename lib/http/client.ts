import { API_BASE_URL } from "@/lib/env";
import {
  clearSession,
  getRefreshToken,
  getToken,
  getUserKind,
  setSession,
  getCurrentUser,
  getCurrentEndUser,
} from "@/lib/auth";
import { ApiError, isRecord } from "./errors";
import { unwrapResponse } from "./response";

export type FetchOptions = RequestInit & {
  _retry?: boolean;
  _skipAuth?: boolean;
  _skipAuthRedirect?: boolean;
  timeoutMs?: number;
};
export function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  return entries.length
    ? `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)]))}`
    : "";
}
async function boundedFetch(url: string, init: RequestInit, timeoutMs = 30_000) {
  const controller = new AbortController();
  const cancel = () => controller.abort(init.signal?.reason);
  if (init.signal?.aborted) cancel();
  else init.signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(
    () => controller.abort(new DOMException("Request timed out", "TimeoutError")),
    timeoutMs,
  );
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
    });
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      json: async (): Promise<unknown> => JSON.parse(body),
    };
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError(
      controller.signal.aborted
        ? "The request timed out. Please retry."
        : "Could not reach the server. Please retry.",
      0,
    );
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", cancel);
  }
}
let refreshPromise: Promise<boolean> | null = null;
async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  const originalToken = getToken();
  if (!refresh) return false;
  try {
    const response = await boundedFetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refresh}` },
    });
    if (!response.ok) return false;
    const raw: unknown = await response.json();
    const body = unwrapResponse(raw);
    const token = isRecord(body) ? (body.accessToken ?? body.token) : undefined;
    if (typeof token !== "string" || !token) return false;
    // A logout or a different login must not be overwritten by an old refresh.
    if (getToken() !== originalToken || getRefreshToken() !== refresh) return false;
    const kind = getUserKind();
    const user = kind === "home-care" ? getCurrentUser() : getCurrentEndUser();
    if (!kind || !user) return false;
    const nextRefresh =
      isRecord(body) && typeof body.refreshToken === "string" ? body.refreshToken : refresh;
    setSession(token, nextRefresh, user, kind);
    return true;
  } catch {
    return false;
  }
}
function refreshOnce() {
  if (!refreshPromise)
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}
function expireSession(originalToken: string | null, skipRedirect?: boolean) {
  if (getToken() !== originalToken) return;
  clearSession();
  if (!skipRedirect && typeof window !== "undefined") {
    const next = window.location.pathname;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
}
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError("API base URL is not configured.", 0);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
    throw new ApiError("Invalid API path.", 0);
  const { _retry, _skipAuth, _skipAuthRedirect, timeoutMs, ...init } = options;
  const token = _skipAuth ? null : getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await boundedFetch(`${API_BASE_URL}${path}`, { ...init, headers }, timeoutMs);
  if (response.status === 401 && !_skipAuth) {
    if (!_retry && getToken() && getToken() !== token)
      return apiFetch<T>(path, { ...options, _retry: true });
    if (!_retry && (await refreshOnce())) return apiFetch<T>(path, { ...options, _retry: true });
    expireSession(token, _skipAuthRedirect);
    throw new ApiError("Session expired. Please sign in again.", 401);
  }
  if (response.status === 204) return undefined as T;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      response.ok ? "The server returned an invalid response." : "Request failed.",
      response.ok ? 502 : response.status,
    );
  }
  return unwrapResponse(body, response.status) as T;
}
