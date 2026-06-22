import { NextRequest, NextResponse } from "next/server";
import { callUpstream } from "@/lib/server-upstream";
import { setAuthCookies, type SessionKind } from "@/lib/server-auth";
import { csrfCheck } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import type { LoginResult, EndUser } from "@/lib/types.api";

type Body = { kind: SessionKind; email: string; password: string };

function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: NextRequest) {
  const csrf = csrfCheck(req);
  if (csrf) return noStore(NextResponse.json({ statusCode: 403, message: csrf, status: "Failure" }, { status: 403 }));

  const rl = checkRateLimit(req, "auth-login", 10, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json(
      { statusCode: 429, message: `Too many sign-in attempts. Try again in ${rl.retryAfterSeconds}s.`, status: "Failure" },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(rl.retryAfterSeconds));
    return noStore(res);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return noStore(NextResponse.json(
      { statusCode: 400, message: "Invalid JSON body.", status: "Failure" },
      { status: 400 },
    ));
  }

  if (!body || (body.kind !== "home-care" && body.kind !== "end-user")) {
    return noStore(NextResponse.json(
      { statusCode: 400, message: "Missing or invalid 'kind'.", status: "Failure" },
      { status: 400 },
    ));
  }
  if (!body.email || !body.password) {
    return noStore(NextResponse.json(
      { statusCode: 400, message: "Email and password are required.", status: "Failure" },
      { status: 400 },
    ));
  }

  const upstreamPath = body.kind === "home-care" ? "/home-care/login" : "/auth/login";
  const upstream = await callUpstream(upstreamPath, {
    method: "POST",
    body: { email: body.email, password: body.password },
  });

  if (!upstream.ok) {
    return noStore(NextResponse.json(upstream.body ?? { statusCode: upstream.status, message: "Login failed." }, { status: upstream.status }));
  }

  const env = upstream.body as { result?: LoginResult | EndUser };
  const result = env?.result;
  if (!result) {
    return noStore(NextResponse.json({ statusCode: 500, message: "Malformed login response.", status: "Failure" }, { status: 500 }));
  }

  let token: string | undefined;
  let refreshToken: string | undefined;
  let user: object | undefined;

  if (body.kind === "home-care") {
    const r = result as LoginResult;
    token = r.token;
    refreshToken = r.refreshToken;
    user = r.user;
  } else {
    const r = result as EndUser;
    token = r.token;
    refreshToken = r.refreshToken;
    const { token: _t, refreshToken: _rt, ...rest } = r;
    void _t; void _rt;
    user = rest;
  }

  if (!token || !refreshToken || !user) {
    return noStore(NextResponse.json({ statusCode: 500, message: "Login response missing tokens.", status: "Failure" }, { status: 500 }));
  }

  const response = NextResponse.json({ statusCode: 200, message: "OK", status: "Success", result: { user } });
  setAuthCookies(response, { token, refreshToken, user, kind: body.kind });
  return noStore(response);
}
