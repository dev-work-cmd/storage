// Owns lightweight login throttling for server-action based username auth.
// Complements Better Auth's route-level limiter because auth.api calls run server-side.
// Uses in-memory counters for Stage 03; Stage 18 can replace this with durable storage.
import "server-only";

const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type LoginRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkLoginRateLimit(key: string): LoginRateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (bucket.count >= LOGIN_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function clearLoginRateLimit(key: string) {
  buckets.delete(key);
}
