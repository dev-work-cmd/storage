// Owns lightweight upload throttling for authenticated document intake.
// Slows accidental or automated upload abuse before durable rate limiting exists.
// Uses in-memory counters for Stage 06; Stage 18 can replace this with persistent storage.
import "server-only";

const UPLOAD_WINDOW_MS = 60 * 1000;
const UPLOAD_MAX_ATTEMPTS = 10;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type UploadRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkUploadRateLimit(key: string): UploadRateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + UPLOAD_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (bucket.count >= UPLOAD_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}
