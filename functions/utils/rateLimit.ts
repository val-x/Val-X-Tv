import { Context, Next } from 'hono';

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW || '60000'); // 1 minute default
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100'); // 100 requests per window

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    await next();
    return;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return c.json(
      {
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS} requests per ${WINDOW_MS / 1000} seconds`,
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      },
      429
    );
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetAt) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  await next();
}

/**
 * Stricter rate limit for upload endpoints
 */
export async function uploadRateLimitMiddleware(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const key = `upload_rate_limit:${ip}`;
  const now = Date.now();
  const UPLOAD_WINDOW = 600000; // 10 minutes
  const MAX_UPLOADS = 5; // 5 uploads per 10 minutes
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + UPLOAD_WINDOW,
    });
    await next();
    return;
  }
  
  if (record.count >= MAX_UPLOADS) {
    return c.json(
      {
        error: 'Upload rate limit exceeded',
        message: `Maximum ${MAX_UPLOADS} uploads per ${UPLOAD_WINDOW / 60000} minutes`,
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      },
      429
    );
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  await next();
}

