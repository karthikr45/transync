// Same-origin proxy. Tokens never leave the cookie store. We:
//   1) enforce an allow-list of upstream paths,
//   2) verify Origin for unsafe methods (CSRF defence),
//   3) forward with the Bearer token from the cookie,
//   4) transparently refresh on 401 and retry once.

import { NextRequest, NextResponse } from "next/server";
import { callUpstream, extractRefreshedToken } from "@/lib/server-upstream";
import {
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
  setAccessTokenCookie,
} from "@/lib/server-auth";
import { csrfCheck } from "@/lib/csrf";

const NO_BODY = new Set(["GET", "HEAD", "DELETE", "OPTIONS"]);

// Allow-list of upstream paths we are willing to forward to. Anything
// outside this list is rejected with 404 to avoid being a generic
// reverse proxy.
const ALLOW: RegExp[] = [
  /^\/home-care\/pending$/,
  /^\/home-care\/(approve|reject)\/[a-zA-Z0-9_-]+$/,
  /^\/home-care\/devices\/(upload|users|compliance-report)$/,
  /^\/event\/(getLastSyncDate|getLastEventCode|getDataBySession|reportBySession|getAverageTime|getAverageAHI|getAverageLeak|getAverageMaskRemoved|getSleepScore|getSessionSleepScore|totalRunningTime)$/,
  /^\/event\/(v3\/)?save$/,
  /^\/device-setup\/(save|getByDeviceId)$/,
];

function isAllowed(path: string): boolean {
  return ALLOW.some((re) => re.test(path));
}

function jsonRes(body: unknown, status: number): NextResponse {
  const res = NextResponse.json(body ?? null, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}

async function handle(req: NextRequest, pathSegments: string[]) {
  // CSRF check on unsafe methods (GETs are exempt; SameSite=Lax handles them).
  const csrf = csrfCheck(req);
  if (csrf) return jsonRes({ statusCode: 403, message: csrf, status: "Failure" }, 403);

  const upstreamPath = "/" + pathSegments.map(encodeURIComponent).join("/");
  if (!isAllowed(upstreamPath)) {
    return jsonRes({ statusCode: 404, message: "Path not allowed.", status: "Failure" }, 404);
  }

  const method = req.method.toUpperCase();
  const reqBody = NO_BODY.has(method) ? undefined : await req.text();
  const parsedBody = reqBody && reqBody.length > 0 ? safeJson(reqBody) : undefined;

  const access = readAccessToken(req);
  const refresh = readRefreshToken(req);

  const doFetch = (token: string | undefined) =>
    callUpstream(upstreamPath, {
      method,
      body: parsedBody,
      token,
      searchParams: req.nextUrl.searchParams.toString(),
    });

  const first = await doFetch(access);
  if (first.status !== 401) return jsonRes(first.body, first.status);

  if (!refresh) {
    const r = jsonRes(first.body, 401);
    clearAuthCookies(r);
    return r;
  }

  const refreshRes = await callUpstream("/auth/refresh", { method: "POST", token: refresh });
  if (!refreshRes.ok) {
    const r = jsonRes(first.body ?? { statusCode: 401, message: "Session expired.", status: "Failure" }, 401);
    clearAuthCookies(r);
    return r;
  }
  const newToken = extractRefreshedToken(refreshRes.body);
  if (!newToken) {
    const r = jsonRes({ statusCode: 401, message: "Session expired.", status: "Failure" }, 401);
    clearAuthCookies(r);
    return r;
  }

  const retry = await doFetch(newToken);
  const out = jsonRes(retry.body, retry.status);
  setAccessTokenCookie(out, newToken);
  return out;
}

type Ctx = { params: { path: string[] } };

export async function GET(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function POST(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function PUT(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function PATCH(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return handle(req, ctx.params.path ?? []); }
