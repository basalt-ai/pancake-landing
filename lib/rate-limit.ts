import "server-only";

/**
 * Tiny in-memory rate limiter (fixed window).
 *
 * Caveat: state lives in a single serverless instance, so limits are per-
 * instance, not global. That's fine as a first-line bot/spam guardrail on a
 * community board — it stops the obvious floods without standing up Redis. If
 * abuse becomes real, swap this for Upstash/Vercel KV behind the same API.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > 5000) {
    buckets.forEach((b, k) => {
      if (now > b.resetAt) buckets.delete(k);
    });
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
