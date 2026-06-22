import { NextRequest, NextResponse } from "next/server";
import { callUpstream } from "@/lib/server-upstream";
import { csrfCheck } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: NextRequest) {
  const csrf = csrfCheck(req);
  if (csrf) return noStore(NextResponse.json({ statusCode: 403, message: csrf, status: "Failure" }, { status: 403 }));
  const rl = checkRateLimit(req, "register-home-care", 5, 60_000);
  if (!rl.ok) {
    const r = NextResponse.json({ statusCode: 429, message: "Too many registration attempts.", status: "Failure" }, { status: 429 });
    r.headers.set("Retry-After", String(rl.retryAfterSeconds));
    return noStore(r);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ statusCode: 400, message: "Invalid JSON body.", status: "Failure" }, { status: 400 }));
  }
  const upstream = await callUpstream("/home-care/register", { method: "POST", body });
  return noStore(NextResponse.json(upstream.body ?? null, { status: upstream.status }));
}
