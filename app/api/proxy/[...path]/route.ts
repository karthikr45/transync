// Generic same-origin proxy. The browser never sees the access token.
// Reads the access token cookie, forwards to the upstream backend, and
// on 401 transparently refreshes (if a refresh token is present) and
// retries once.

import { NextRequest, NextResponse } from "next/server";
import { callUpstream, extractRefreshedToken } from "@/lib/server-upstream";
import {
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
  setAccessTokenCookie,
} from "@/lib/server-auth";

const NO_BODY = new Set(["GET", "HEAD", "DELETE", "OPTIONS"]);

async function handle(req: NextRequest, pathSegments: string[]) {
  const upstreamPath = "/" + pathSegments.map(encodeURIComponent).join("/");
  const search = req.nextUrl.searchParams;
  const method = req.method.toUpperCase();
  const reqBody = NO_BODY.has(method) ? undefined : await req.text();
  const parsedBody = reqBody && reqBody.length > 0 ? safeJson(reqBody) : undefined;

  const access = readAccessToken(req);
  const refresh = readRefreshToken(req);

  const doFetch = async (token: string | undefined) =>
    callUpstream(upstreamPath, {
      method,
      body: parsedBody,
      token,
      searchParams: search.toString(),
    });

  let first = await doFetch(access);
  if (first.status !== 401) return wrap(first.body, first.status);

  // 401: try refresh once.
  if (!refresh) {
    const r = wrap(first.body, 401);
    clearAuthCookies(r);
    return r;
  }

  const refreshRes = await callUpstream("/auth/refresh", { method: "POST", token: refresh });
  if (!refreshRes.ok) {
    const r = wrap(first.body ?? { statusCode: 401, message: "Session expired.", status: "Failure" }, 401);
    clearAuthCookies(r);
    return r;
  }
  const newToken = extractRefreshedToken(refreshRes.body);
  if (!newToken) {
    const r = wrap({ statusCode: 401, message: "Session expired.", status: "Failure" }, 401);
    clearAuthCookies(r);
    return r;
  }

  const retry = await doFetch(newToken);
  const out = wrap(retry.body, retry.status);
  setAccessTokenCookie(out, newToken);
  return out;
}

function wrap(body: unknown, status: number): NextResponse {
  return NextResponse.json(body ?? null, { status });
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}

type Ctx = { params: { path: string[] } };

export async function GET(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function POST(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function PUT(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function PATCH(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
