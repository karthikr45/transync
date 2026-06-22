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
  const rl = checkRateLimit(req, "register-verify", 10, 60_000);
  if (!rl.ok) {
    const r = NextResponse.json({ statusCode: 429, message: "Too many verification attempts.", status: "Failure" }, { status: 429 });
    r.headers.set("Retry-After", String(rl.retryAfterSeconds));
    return noStore(r);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return noStore(NextResponse.json({ statusCode: 400, message: "Invalid JSON body.", status: "Failure" }, { status: 400 }));
  }

  const parsed = (raw && typeof raw === "object") ? (raw as { email?: unknown; otp?: unknown }) : null;
  const email = typeof parsed?.email === "string" ? parsed.email.trim() : "";
  const otpRaw = parsed?.otp;
  const otpNum =
    typeof otpRaw === "number" && Number.isFinite(otpRaw)
      ? otpRaw
      : typeof otpRaw === "string" && otpRaw.trim() !== ""
        ? Number(otpRaw.trim())
        : NaN;

  if (!email || !Number.isFinite(otpNum)) {
    return noStore(NextResponse.json(
      { statusCode: 400, message: "Email and a numeric OTP are required.", status: "Failure" },
      { status: 400 },
    ));
  }

  // Send a strictly-shaped body so undefined fields never reach upstream.
  const upstream = await callUpstream("/auth/validate-otp", {
    method: "POST",
    body: { email, otp: otpNum },
  });
  return noStore(NextResponse.json(upstream.body ?? null, { status: upstream.status }));
}
