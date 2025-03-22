import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { TRPCError } from '@trpc/server';
import { logSecurityEvent } from './security-logger';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

// Create Redis instance
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Define durations
const ONE_HOUR = '1 h';
const ONE_DAY = '1 d';
const FIFTEEN_MINUTES = '15 m';

// Create a new ratelimiter for free challenges using sliding window
export const freeChallengesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, ONE_DAY),
  analytics: true,
  prefix: '@upstash/ratelimit/free-challenges',
})

// Create a new ratelimiter for authenticated challenges using sliding window
export const authenticatedChallengesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, ONE_DAY),
  analytics: true,
  prefix: '@upstash/ratelimit/auth-challenges',
});

// Create a new ratelimiter for chat messages using sliding window
export const chatMessagesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, ONE_HOUR),
  analytics: true,
  prefix: '@upstash/ratelimit/chat-messages',
});

// Create a new ratelimiter for authenticated chat messages
export const authenticatedFreeChatMessagesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, ONE_HOUR),
  analytics: true,
  prefix: '@upstash/ratelimit/auth-chat-messages',
});

// Create a new ratelimiter for authentication attempts
export const authAttemptsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, FIFTEEN_MINUTES),
  analytics: true,
  prefix: '@upstash/ratelimit/auth-attempts',
});

// Create a new ratelimiter for general API requests
export const apiRequestsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, ONE_HOUR),
  analytics: true,
  prefix: '@upstash/ratelimit/api-requests',
});

// Helper to get identifier for rate limiting (combines IP and optional user ID)
export function getRateLimitIdentifier(
  ipAddress: string | null | undefined, 
  userId?: string | null
): string {
  // If we have a userId, add it to the identifier to prevent user hopping IPs
  const userPart = userId ? `:user_${userId}` : '';
  return `${ipAddress ?? '127.0.0.1'}${userPart}`;
}

// Check rate limit and throw error if exceeded, also logs security event
export async function enforceRateLimit({
  limiter,
  identifier,
  userId,
  ipAddress,
  endpoint,
  errorMessage,
  limitType,
  metadata = {},
}: {
  limiter: Ratelimit;
  identifier: string;
  userId?: string | null;
  ipAddress?: string | null;
  endpoint: string;
  errorMessage: string;
  limitType: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await limiter.limit(identifier);

  if (!response.success) {
    const resetDate = new Date(response.reset);
    const formattedTime = resetDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Log the rate limit exceeded event
    logSecurityEvent({
      eventType: 'rate-limit-exceeded',
      message: `Rate limit exceeded for ${limitType}`,
      userId: userId ?? undefined,
      ipAddress: ipAddress ?? undefined,
      endpoint,
      metadata: {
        limitType,
        reset: response.reset,
        ...metadata
      }
    });

    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `${errorMessage}. You can try again at ${formattedTime}`,
    });
  }

  return response;
}
