import "server-only";

/**
 * Small in-memory sliding-window limiter for the auth + order endpoints.
 *
 * Good enough for a single instance; behind multiple instances swap the Map
 * for Redis/Upstash (see docs/INTEGRATIONS.md) — the call sites stay the same.
 */
const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - hits[0])) / 1000);
    buckets.set(key, hits);
    return { ok: false, retryAfterSeconds };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client identifier for rate limiting. */
export function clientKey(request: Request, suffix = ""): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${suffix}`;
}
