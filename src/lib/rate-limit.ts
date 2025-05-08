import { Redis } from '@upstash/redis'
import { Ratelimit, type Duration } from '@upstash/ratelimit'
import { TRPCError } from '@trpc/server';
import { logSecurityEvent } from './security-logger';

const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

// Interface to ensure consistent type between Ratelimit and InMemoryRateLimit
interface RateLimiter {
  limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;
  
  // Add getRemaining method that's used in the routers
  getRemaining(identifier: string): Promise<{
    remaining: number;
    reset: number;
    limit: number;
  }>;
}

// Extend the Upstash Ratelimit type to include our getRemaining method
interface ExtendedRatelimit extends Ratelimit {
  getRemaining(identifier: string): Promise<{
    remaining: number;
    reset: number;
    limit: number;
  }>;
}

// In-memory storage for dev mode rate limiting
class InMemoryRateLimit implements RateLimiter {
  private storage = new Map<string, { count: number, reset: number }>();
  private limitCount: number;
  private windowInMs: number;
  private prefix: string;

  constructor({ limit, window, prefix }: { limit: number, window: string, prefix: string }) {
    this.limitCount = limit;
    // Parse window string (e.g., "1 h", "15 m") to milliseconds
    const parts = window.split(' ');
    const amount = parseInt(parts[0] ?? '1');
    const unit = parts.length > 1 ? parts[1] : 's';
    
    const multiplier = 
      unit === 'h' ? 60 * 60 * 1000 : 
      unit === 'm' ? 60 * 1000 : 
      unit === 'd' ? 24 * 60 * 60 * 1000 : 
      1000; // default to seconds
      
    this.windowInMs = amount * multiplier;
    this.prefix = prefix;
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number; }> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    
    // Get or create entry
    let entry = this.storage.get(key);
    if (!entry || now > entry.reset) {
      entry = { count: 0, reset: now + this.windowInMs };
      this.storage.set(key, entry);
    }
    
    // Increment count
    entry.count++;
    
    // Check if limit exceeded
    const success = entry.count <= this.limitCount;
    const remaining = Math.max(0, this.limitCount - entry.count);
    
    return {
      success,
      limit: this.limitCount,
      remaining,
      reset: entry.reset
    };
  }
  
  // Implementation of getRemaining method for in-memory rate limiter
  async getRemaining(identifier: string): Promise<{ remaining: number; reset: number; limit: number; }> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    
    // Get or create entry without incrementing count
    const entry = this.storage.get(key);
    if (!entry || now > entry.reset) {
      // The window has expired or no entry exists, so create a fresh one
      return {
        remaining: this.limitCount,
        reset: now + this.windowInMs,
        limit: this.limitCount
      };
    }
    
    // Calculate remaining based on current count
    const remaining = Math.max(0, this.limitCount - entry.count);
    
    return {
      remaining,
      reset: entry.reset,
      limit: this.limitCount
    };
  }
}

// Create Redis instance or use in-memory store
export const redis = isDevelopmentMode 
  ? null 
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
    });

// Define durations
const ONE_HOUR = '1 h';
const ONE_DAY = '1 d';
const FIFTEEN_MINUTES = '15 m';

// Convert string duration to Upstash Duration format
function convertToDuration(window: string): Duration {
  const parts = window.split(' ');
  const amount = parseInt(parts[0] ?? '1');
  const unit = parts.length > 1 ? parts[1] : 's';
  
  // Map unit to Duration format
  switch(unit) {
    case 'h': return `${amount} h` as Duration;
    case 'm': return `${amount} m` as Duration;
    case 'd': return `${amount} d` as Duration;
    default: return `${amount} s` as Duration;
  }
}

// Factory function to create appropriate rate limiter based on environment
function createRateLimiter(options: { 
  limit: number, 
  window: string, 
  prefix: string 
}): RateLimiter {
  if (isDevelopmentMode) {
    return new InMemoryRateLimit({
      limit: options.limit,
      window: options.window,
      prefix: options.prefix
    });
  } else {
    // For production, we need to extend the Ratelimit class to implement our interface
    const ratelimiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(options.limit, convertToDuration(options.window)),
      analytics: true,
      prefix: options.prefix,
    }) as ExtendedRatelimit;
    
    // Add the getRemaining method to make it compatible with our RateLimiter interface
    ratelimiter.getRemaining = async (identifier: string) => {
      // Use the limit method but with a count of 0 to not consume any tokens
      const result = await ratelimiter.limit(identifier);
      return {
        remaining: result.remaining,
        reset: result.reset,
        limit: result.limit
      };
    };
    
    return ratelimiter;
  }
}

// Create a new ratelimiter for free challenges using sliding window
export const freeChallengesLimiter = createRateLimiter({
  limit: 5,
  window: ONE_DAY,
  prefix: '@upstash/ratelimit/free-challenges'
});

// Create a new ratelimiter for authenticated challenges using sliding window
export const authenticatedChallengesLimiter = createRateLimiter({
  limit: 5,
  window: ONE_DAY,
  prefix: '@upstash/ratelimit/auth-challenges'
});

// Create a new ratelimiter for chat messages using sliding window
export const chatMessagesLimiter = createRateLimiter({
  limit: 3,
  window: ONE_HOUR,
  prefix: '@upstash/ratelimit/chat-messages'
});

// Create a new ratelimiter for authenticated chat messages
export const authenticatedFreeChatMessagesLimiter = createRateLimiter({
  limit: 3,
  window: ONE_HOUR,
  prefix: '@upstash/ratelimit/auth-chat-messages'
});

// Create a new ratelimiter for authentication attempts
export const authAttemptsLimiter = createRateLimiter({
  limit: 10,
  window: FIFTEEN_MINUTES,
  prefix: '@upstash/ratelimit/auth-attempts'
});

// Create a new ratelimiter for unauthenticated playground users (more strict)
export const unauthenticatedPlaygroundLimiter = createRateLimiter({
  limit: 5,
  window: ONE_DAY,
  prefix: '@upstash/ratelimit/unauth-playground'
});

// Create a new ratelimiter for general API requests
export const apiRequestsLimiter = createRateLimiter({
  limit: 300,
  window: ONE_HOUR,
  prefix: '@upstash/ratelimit/api-requests'
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
  limiter: RateLimiter;
  identifier: string;
  userId?: string | null;
  ipAddress?: string | null;
  endpoint: string;
  errorMessage: string;
  limitType: string;
  metadata?: Record<string, unknown>;
}) {
  // In development mode, ensure userId is set to dev_user_123 for consistent credit usage
  if (isDevelopmentMode && !userId) {
    userId = "dev_user_123";
  }

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
