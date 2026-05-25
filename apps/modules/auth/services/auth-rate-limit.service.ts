type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

type RateLimitBucket = {
  attempts: number;
  resetAt: number;
};

const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

const globalForRateLimit = globalThis as unknown as {
  authRateLimitBuckets?: Map<string, RateLimitBucket>;
};

const buckets = globalForRateLimit.authRateLimitBuckets ?? new Map<string, RateLimitBucket>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.authRateLimitBuckets = buckets;
}

function now() {
  return Date.now();
}

function getRetryAfterSeconds(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - now()) / 1000));
}

export const authRateLimitService = {
  consume(key: string): RateLimitResult {
    const currentTime = now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= currentTime) {
      buckets.set(key, {
        attempts: 1,
        resetAt: currentTime + windowMs
      });
      return { limited: false, retryAfterSeconds: 0 };
    }

    if (bucket.attempts >= maxAttempts) {
      return {
        limited: true,
        retryAfterSeconds: getRetryAfterSeconds(bucket.resetAt)
      };
    }

    bucket.attempts += 1;
    return { limited: false, retryAfterSeconds: 0 };
  },

  reset(key: string) {
    buckets.delete(key);
  }
};
