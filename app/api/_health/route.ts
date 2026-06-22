// Runtime config + upstream reachability check. In development we also
// include the resolved upstream URL so you can confirm what was loaded
// from .env.local. In production we never expose it.

import { NextResponse } from "next/server";
import { API_BASE_URL, HAS_API_BASE_URL } from "@/lib/env";

export async function GET() {
  const isDev = process.env.NODE_ENV !== "production";
  let upstream: { reachable: boolean; status?: number; error?: string } = { reachable: false };

  if (HAS_API_BASE_URL) {
    try {
      const r = await fetch(API_BASE_URL, {
        method: "HEAD",
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" },
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
      apiBaseUrl: isDev ? API_BASE_URL || null : undefined,
      upstream,
      env: process.env.NODE_ENV,
      ts: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
