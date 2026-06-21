import { NextRequest, NextResponse } from "next/server";
import { callUpstream } from "@/lib/server-upstream";
import { setAuthCookies, type SessionKind } from "@/lib/server-auth";
import type { LoginResult, EndUser } from "@/lib/types.api";

type Body = { kind: SessionKind; email: string; password: string };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { statusCode: 400, message: "Invalid JSON body.", status: "Failure" },
      { status: 400 },
    );
  }

  if (!body || (body.kind !== "home-care" && body.kind !== "end-user")) {
    return NextResponse.json(
      { statusCode: 400, message: "Missing or invalid 'kind'.", status: "Failure" },
      { status: 400 },
    );
  }
  if (!body.email || !body.password) {
    return NextResponse.json(
      { statusCode: 400, message: "Email and password are required.", status: "Failure" },
      { status: 400 },
    );
  }

  const upstreamPath = body.kind === "home-care" ? "/home-care/login" : "/auth/login";
  const upstream = await callUpstream(upstreamPath, {
    method: "POST",
    body: { email: body.email, password: body.password },
  });

  if (!upstream.ok) {
    return NextResponse.json(upstream.body ?? { statusCode: upstream.status, message: "Login failed." }, { status: upstream.status });
  }

  // Both backends return the envelope. Different inner shapes.
  const env = upstream.body as { result?: LoginResult | EndUser };
  const result = env?.result;
  if (!result) {
    return NextResponse.json({ statusCode: 500, message: "Malformed login response.", status: "Failure" }, { status: 500 });
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
    // Strip tokens before storing user in a client-readable cookie.
    const { token: _t, refreshToken: _rt, ...rest } = r;
    void _t; void _rt;
    user = rest;
  }

  if (!token || !refreshToken || !user) {
    return NextResponse.json({ statusCode: 500, message: "Login response missing tokens.", status: "Failure" }, { status: 500 });
  }

  const response = NextResponse.json({ statusCode: 200, message: "OK", status: "Success", result: { user } });
  setAuthCookies(response, { token, refreshToken, user, kind: body.kind });
  return response;
}
