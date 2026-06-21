import { NextRequest, NextResponse } from "next/server";
import { callUpstream } from "@/lib/server-upstream";
import { setAuthCookies } from "@/lib/server-auth";
import type { EndUser } from "@/lib/types.api";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ statusCode: 400, message: "Invalid JSON body.", status: "Failure" }, { status: 400 });
  }

  const upstream = await callUpstream("/users/create-user", { method: "POST", body });
  if (!upstream.ok) {
    return NextResponse.json(upstream.body ?? null, { status: upstream.status });
  }

  const env = upstream.body as { result?: EndUser };
  const result = env?.result;
  if (!result || !result.token || !result.refreshToken) {
    return NextResponse.json({ statusCode: 500, message: "Malformed create-user response.", status: "Failure" }, { status: 500 });
  }

  const { token, refreshToken } = result;
  // Strip tokens from the client-readable user cookie.
  const { token: _t, refreshToken: _rt, ...user } = result;
  void _t; void _rt;

  const response = NextResponse.json({ statusCode: 200, message: "OK", status: "Success", result: { user } });
  setAuthCookies(response, { token, refreshToken, user, kind: "end-user" });
  return response;
}
