import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/server-auth";
import { csrfCheck } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrf = csrfCheck(req);
  if (csrf) {
    const r = NextResponse.json({ statusCode: 403, message: csrf, status: "Failure" }, { status: 403 });
    r.headers.set("Cache-Control", "no-store");
    return r;
  }
  const response = NextResponse.json({ statusCode: 200, message: "Logged out.", status: "Success", result: null });
  clearAuthCookies(response);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
