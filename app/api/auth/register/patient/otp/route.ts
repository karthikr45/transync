import { NextRequest, NextResponse } from "next/server";
import { callUpstream } from "@/lib/server-upstream";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ statusCode: 400, message: "Invalid JSON body.", status: "Failure" }, { status: 400 });
  }
  const upstream = await callUpstream("/auth/signUp-otp", { method: "POST", body });
  return NextResponse.json(upstream.body ?? null, { status: upstream.status });
}
