import { ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis and RateLimit
// Note: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimit = ratelimit({
  redis,
  limiter: ratelimit.slidingWindow(5, '60 s'), // 5 requests per minute
});

export const generalRateLimit = ratelimit({
  redis,
  limiter: ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
});

export async function withAuthRateLimit(key: string) {
  return authRateLimit(key);
}

