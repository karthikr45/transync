// CSP violation report sink. Browsers POST a JSON envelope describing
// any blocked resource. We log them at warn level (so production builds
// keep them) and optionally forward to an external collector via
// CSP_REPORT_FORWARD_URL.

import { NextRequest, NextResponse } from "next/server";

const FORWARD_URL = process.env.CSP_REPORT_FORWARD_URL?.trim();

export async function POST(req: NextRequest) {
  let body: unknown = null;
  try { body = await req.json(); } catch { /* ignore */ }
  // Browsers may send `application/csp-report` or `application/reports+json`
  // depending on Reporting API version.
  console.warn("[CSP] violation report", JSON.stringify(body));

  if (FORWARD_URL) {
    try {
      await fetch(FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch (e) {
      console.warn("[CSP] failed to forward report", e);
    }
  }

  // Spec says return 204; some browsers expect 200.
  return new NextResponse(null, { status: 204 });
}
