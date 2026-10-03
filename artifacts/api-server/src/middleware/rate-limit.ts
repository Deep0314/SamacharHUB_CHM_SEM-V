/**
 * SamacharHUB — Rate Limiting Middleware
 *
 * Simple in-memory rate limiter to protect API endpoints from abuse.
 * Uses a sliding window approach per IP address.
 *
 * Limits:
 *  - Public endpoints: 60 req/min
 *  - Auth endpoints (login): 10 req/min  (brute-force protection)
 *  - Contact/Subscribe: 5 req/min        (spam protection)
 */

import type { Request, Response, NextFunction } from "express";

interface RateWindow {
  count: number;
  resetAt: number;
}

// In-memory store: Map<ip-key, RateWindow>
const store = new Map<string, RateWindow>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of store.entries()) {
    if (now > window.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

/**
 * Creates a rate-limiting middleware.
 *
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs    - Time window in milliseconds
 * @param message     - Error message to return when limit is exceeded
 */
export function rateLimit(
  maxRequests: number,
  windowMs: number,
  message = "Too many requests, please try again later."
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIp(req);
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ error: message, retryAfterSeconds: retryAfter });
      return;
    }

    next();
  };
}

// ─────────────────────────────────────────────────────────────
// Preset limiters for common use cases
// ─────────────────────────────────────────────────────────────

/** Standard public API: 60 requests per minute */
export const publicApiLimiter = rateLimit(60, 60_000);

/** Auth endpoints: 10 requests per minute (brute-force protection) */
export const authLimiter = rateLimit(
  10,
  60_000,
  "Too many login attempts. Please wait a minute and try again."
);

/** Contact/Subscribe forms: 5 submissions per minute (spam protection) */
export const formLimiter = rateLimit(
  5,
  60_000,
  "Too many form submissions. Please wait a minute and try again."
);
