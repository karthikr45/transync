// Lightweight in-process rate limiter. For multi-instance production
// deployments, swap the in-memory bucket for Redis (Upstash, Memcached,
// etc.) — the API stays the same.

import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets: Map<string, Bucket> = new Map();

const MAX_TRACKED = 5_000;

function ipFromRequest(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return req.ip ?? "unknown";
}

export type RateLimitVerdict = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(
  req: NextRequest,
  bucketKey: string,
  limit: number,
  windowMs: number,
): RateLimitVerdict {
  const ip = ipFromRequest(req);
  const key = `${ip}:${bucketKey}`;
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Bound memory growth.
    if (buckets.size > MAX_TRACKED) {
      const cutoff = now;
      for (const [k, v] of buckets) if (v.resetAt <= cutoff) buckets.delete(k);
    }
    return { ok: true };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { ok: true };
}
