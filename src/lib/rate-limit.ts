import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

const redis = new Redis({
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
