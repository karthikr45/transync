// CSRF defence: for any state-changing request we require the request's
// Origin (or Referer) host to match our own. Combined with SameSite=Lax
// cookies this blocks cross-site form submissions and fetches from
// reaching our auth + proxy routes.

import type { NextRequest } from "next/server";

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Returns null if the request is safe; otherwise an error message. */
export function csrfCheck(req: NextRequest): string | null {
  if (!UNSAFE.has(req.method.toUpperCase())) return null;
  const expected = req.headers.get("host");
  if (!expected) return "Missing Host header.";

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== expected) return "Cross-origin request blocked.";
      return null;
    } catch {
      return "Malformed Origin header.";
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      if (new URL(referer).host !== expected) return "Cross-origin referer blocked.";
      return null;
    } catch {
      return "Malformed Referer header.";
    }
  }
  // Neither Origin nor Referer present on an unsafe request → reject.
  return "Origin verification required.";
}
