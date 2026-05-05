import type { NextFunction, Request, Response } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter.
 * Production deployments should swap this for a Redis-backed solution
 * (e.g. `rate-limit-redis`) to support multi-instance setups.
 */
export function rateLimiter(opts: { windowMs: number; max: number; message?: string }) {
  const store = new Map<string, RateLimitEntry>();
  const { windowMs, max, message = 'Too many requests, please try again later.' } = opts;

  // Periodic cleanup to prevent memory leaks
  const CLEANUP_INTERVAL_MS = 60_000;
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    // Set standard rate-limit headers
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        error: { message, code: 'RATE_LIMIT_EXCEEDED' },
      });
    }

    return next();
  };
}

/** Pre-built limiters for common use-cases. */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

export const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
