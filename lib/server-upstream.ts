// Server-side helper to call the upstream backend with a Bearer token.

import { API_BASE_URL } from "./env";

export type UpstreamResponse<T = unknown> = {
  status: number;
  ok: boolean;
  body: T;
};

export async function callUpstream<T = unknown>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    token?: string;
    searchParams?: URLSearchParams | string;
  } = {},
): Promise<UpstreamResponse<T>> {
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.token) headers["Authorization"] = `Bearer ${init.token}`;

  const search = init.searchParams
    ? `?${init.searchParams.toString().replace(/^\?/, "")}`
    : "";

  const res = await fetch(`${API_BASE_URL}${path}${search}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  return { status: res.status, ok: res.ok, body: body as T };
}

/**
 * Try to extract a new access token from a /auth/refresh response. The
 * spec returns `{ accessToken }` but some envelopes wrap it as
 * `{ result: { token } }`.
 */
export function extractRefreshedToken(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const direct = (body as { accessToken?: unknown }).accessToken;
  if (typeof direct === "string") return direct;
  const wrapped = (body as { result?: { token?: unknown } }).result?.token;
  if (typeof wrapped === "string") return wrapped;
  return undefined;
}
