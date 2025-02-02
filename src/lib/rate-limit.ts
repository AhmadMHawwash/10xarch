import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

// Create Redis instance
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Create a new ratelimiter that allows 5 tokens per IP per week
export const anonymousCreditsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(40, '1 d'),
  analytics: true,
  prefix: '@upstash/ratelimit/anonymous-credits',
})

// Create a new ratelimiter that allows 30 submissions per day per IP/user
export const freeChallengesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(15, '1 d'),
  analytics: true,
  prefix: '@upstash/ratelimit/free-challenges',
})

// Create a new ratelimiter for chat messages (10 per hour per IP per challenge)
export const chatMessagesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: '@upstash/ratelimit/chat-messages',
})
