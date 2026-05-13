type LoginAttempt = {
  count: number;
  resetAt: number;
};

const loginAttempts = new Map<string, LoginAttempt>();
const rateLimitWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;

function getNow() {
  return Date.now();
}

function pruneExpiredAttempts(now = getNow()) {
  for (const [key, attempt] of loginAttempts.entries()) {
    if (attempt.resetAt <= now) {
      loginAttempts.delete(key);
    }
  }
}

export function getLoginRateLimitKey(ipAddress: string, email: string) {
  return `${ipAddress}:${email.toLowerCase()}`;
}

export function getLoginRateLimitState(key: string) {
  const now = getNow();
  pruneExpiredAttempts(now);

  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return {
      limited: false,
      retryAfterSeconds: 0,
    };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((attempt.resetAt - now) / 1000));

  return {
    limited: attempt.count >= maxLoginAttempts,
    retryAfterSeconds,
  };
}

export function recordFailedLoginAttempt(key: string) {
  const now = getNow();
  pruneExpiredAttempts(now);

  const current = loginAttempts.get(key);

  if (!current) {
    loginAttempts.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return;
  }

  loginAttempts.set(key, {
    ...current,
    count: current.count + 1,
  });
}

export function clearLoginRateLimit(key: string) {
  loginAttempts.delete(key);
}

export function formatRetryAfter(seconds: number) {
  const minutes = Math.ceil(seconds / 60);

  if (minutes <= 1) {
    return "about 1 minute";
  }

  return `about ${minutes} minutes`;
}
