import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory store for rate limiting tokens per key
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to avoid memory leaks
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGcTime = Date.now();

function cleanupExpiredEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastGcTime < GC_INTERVAL_MS) return;
  lastGcTime = now;

  for (const [key, record] of rateLimitStore.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

/**
 * Extracts client IP from standard proxy and edge headers
 */
export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    if (ips[0]) return ips[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export interface RateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowMs: number;
  identifier?: string;
  customMessage?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  response?: NextResponse;
}

/**
 * Reusable sliding-window rate limiter for Next.js Route Handlers
 */
export async function checkRateLimit(
  req: NextRequest,
  options: {
    keyPrefix: string;
    limit: number;
    windowMs: number;
    identifier?: string;
    customMessage?: string;
  }
): Promise<RateLimitResult> {
  const { keyPrefix, limit, windowMs, identifier, customMessage } = options;
  const clientKey = identifier || getClientIp(req);
  const mapKey = `${keyPrefix}:${clientKey}`;
  const now = Date.now();

  cleanupExpiredEntries(windowMs);

  let record = rateLimitStore.get(mapKey);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(mapKey, record);
  }

  // Filter timestamps within the active sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const earliest = record.timestamps[0] || now;
    const resetTime = earliest + windowMs;
    const retryAfterSec = Math.max(1, Math.ceil((resetTime - now) / 1000));

    const response = NextResponse.json(
      {
        error:
          customMessage ||
          `Too many requests. You have exceeded the limit of ${limit} attempts. Please try again in ${retryAfterSec} seconds.`,
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfterSec.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
        },
      }
    );

    return {
      success: false,
      remaining: 0,
      reset: resetTime,
      response,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const reset = now + windowMs;

  return {
    success: true,
    remaining,
    reset,
  };
}
