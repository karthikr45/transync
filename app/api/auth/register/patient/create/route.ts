import { NextRequest, NextResponse } from "next/server";
import { callUpstream } from "@/lib/server-upstream";
import { setAuthCookies } from "@/lib/server-auth";
import { csrfCheck } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import type { EndUser, CreateUserDto } from "@/lib/types.api";

function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

const REQUIRED: (keyof CreateUserDto)[] = [
  "firstName", "lastName", "email", "password", "dob",
  "state", "country", "mobile", "cpapUser", "transcendDevice", "occupation",
];

// Send every optional string field with a safe default. Some upstream
// code paths call crypto / Buffer methods on raw field values, which
// throws if a field arrives as undefined. JSON.stringify drops undefined
// fields entirely, so we ensure defaults are present before forwarding.
function normaliseCreateUserBody(input: unknown): { ok: false; message: string } | { ok: true; body: CreateUserDto } {
  if (!input || typeof input !== "object") return { ok: false, message: "Invalid request body." };
  const src = input as Record<string, unknown>;
  for (const key of REQUIRED) {
    const v = src[key];
    if (typeof v !== "string" || v.length === 0) {
      return { ok: false, message: `${key} is required.` };
    }
  }
  const str = (k: string, fallback = ""): string => (typeof src[k] === "string" ? (src[k] as string) : fallback);
  const num = (k: string): number | undefined => {
    const v = src[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
    return undefined;
  };
  const bool = (k: string): boolean | undefined => (typeof src[k] === "boolean" ? (src[k] as boolean) : undefined);

  const body: CreateUserDto = {
    firstName: str("firstName"),
    lastName: str("lastName"),
    email: str("email").trim(),
    password: str("password"),
    dob: str("dob"),
    state: str("state"),
    country: str("country"),
    mobile: str("mobile"),
    cpapUser: str("cpapUser"),
    transcendDevice: str("transcendDevice"),
    occupation: str("occupation"),
    // Optionals — sent as empty strings (not undefined) to avoid backend
    // crashes when a field is read for hashing / comparison.
    gender: str("gender"),
    city: str("city"),
    pincode: num("pincode"),
    countryCode: str("countryCode"),
    profileImage: str("profileImage"),
    provider: str("provider"),
    providerEmail: str("providerEmail"),
    dealerName: str("dealerName"),
    devicePurchased: str("devicePurchased"),
    timeZone: str("timeZone"),
    deviceId: str("deviceId"),
    eventCount: num("eventCount") ?? 0,
    isFirmwareUpdate: bool("isFirmwareUpdate") ?? false,
  };
  return { ok: true, body };
}

export async function POST(req: NextRequest) {
  const csrf = csrfCheck(req);
  if (csrf) return noStore(NextResponse.json({ statusCode: 403, message: csrf, status: "Failure" }, { status: 403 }));
  const rl = checkRateLimit(req, "register-create", 5, 60_000);
  if (!rl.ok) {
    const r = NextResponse.json({ statusCode: 429, message: "Too many sign-up attempts.", status: "Failure" }, { status: 429 });
    r.headers.set("Retry-After", String(rl.retryAfterSeconds));
    return noStore(r);
  }

  let raw: unknown;
  try { raw = await req.json(); }
  catch {
    return noStore(NextResponse.json({ statusCode: 400, message: "Invalid JSON body.", status: "Failure" }, { status: 400 }));
  }

  const norm = normaliseCreateUserBody(raw);
  if (!norm.ok) {
    return noStore(NextResponse.json({ statusCode: 400, message: norm.message, status: "Failure" }, { status: 400 }));
  }

  const upstream = await callUpstream("/users/create-user", { method: "POST", body: norm.body });
  if (!upstream.ok) {
    return noStore(NextResponse.json(upstream.body ?? null, { status: upstream.status }));
  }

  const env = upstream.body as { result?: EndUser };
  const result = env?.result;
  if (!result || !result.token || !result.refreshToken) {
    return noStore(NextResponse.json({ statusCode: 500, message: "Malformed create-user response.", status: "Failure" }, { status: 500 }));
  }

  const { token, refreshToken } = result;
  const { token: _t, refreshToken: _rt, ...user } = result;
  void _t; void _rt;

  const response = NextResponse.json({ statusCode: 200, message: "OK", status: "Success", result: { user } });
  setAuthCookies(response, { token, refreshToken, user, kind: "end-user" });
  return noStore(response);
}
