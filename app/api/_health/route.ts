// Lightweight runtime config check. Does NOT expose the upstream URL,
// only whether it's configured and a one-shot upstream reachability
// check. Safe to hit anonymously.

import { NextResponse } from "next/server";
import { API_BASE_URL, HAS_API_BASE_URL } from "@/lib/env";

export async function GET() {
  let upstream: { reachable: boolean; status?: number; error?: string } = { reachable: false };
  if (HAS_API_BASE_URL) {
    try {
      const r = await fetch(API_BASE_URL, {
        method: "HEAD",
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" },
        // Hard cap so a broken upstream can't hang the health check.
        signal: AbortSignal.timeout(3000),
      });
      upstream = { reachable: true, status: r.status };
    } catch (e) {
      upstream = { reachable: false, error: (e as Error).message };
    }
  }
  return NextResponse.json(
    {
      apiBaseUrlConfigured: HAS_API_BASE_URL,
      upstream,
      env: process.env.NODE_ENV,
      ts: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
