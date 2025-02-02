import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'

interface MessageWithTimestamp {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
      }

const chatSessions = new Map<
  string,
  {
    messages: MessageWithTimestamp[]
    messageCountPerChallenge: Map<string, { count: number; lastResetTime: number }>
      }
>()

const MESSAGE_LIMIT_PER_HOUR = 10
const ONE_HOUR_MS = 60 * 60 * 1000

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        sessionId: z.string(),
        challengeId: z.string(),
        history: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
            timestamp: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { message, sessionId, challengeId, history } = input
      const currentTime = Date.now()

      // Get or create session
      if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, { 
          messages: [], 
          messageCountPerChallenge: new Map()
            })
        }

      const session = chatSessions.get(sessionId)!

      // Get or initialize challenge message counter
      if (!session.messageCountPerChallenge.has(challengeId)) {
        session.messageCountPerChallenge.set(challengeId, {
          count: 0,
          lastResetTime: currentTime
            })
          }

      const challengeCounter = session.messageCountPerChallenge.get(challengeId)!

      // Reset counter if an hour has passed
      if (currentTime - challengeCounter.lastResetTime >= ONE_HOUR_MS) {
        challengeCounter.count = 0
        challengeCounter.lastResetTime = currentTime
        }

      // Check if user has reached the message limit for this challenge
      if (challengeCounter.count >= MESSAGE_LIMIT_PER_HOUR) {
        const minutesUntilReset = Math.ceil(
          (challengeCounter.lastResetTime + ONE_HOUR_MS - currentTime) / (60 * 1000)
            )
        throw new Error(
          `You have reached your limit of ${MESSAGE_LIMIT_PER_HOUR} messages per hour for this challenge. Please try again in ${minutesUntilReset} minutes.`
          )
        }

      session.messages = history || []
      challengeCounter.count += 1

        // Prepare messages for OpenAI
        const messages = [
          { role: 'system' as const, content: SYSTEM_PROMPT },
        ...session.messages,
          { role: 'user' as const, content: message },
        ]

          // Call OpenAI API
          const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: messages.map(({ role, content }) => ({ role, content })),
            temperature: 0.1,
        max_tokens: 100,
          })

      const response = {
        role: 'assistant' as const,
        content: completion.choices[0]?.message?.content ?? 'No response generated.',
        timestamp: currentTime,
          }

      // Update session with the new messages
      session.messages = [
        ...session.messages,
        { role: 'user', content: message, timestamp: currentTime },
        response,
      ]

          return {
        message: response.content,
        remainingMessages: MESSAGE_LIMIT_PER_HOUR - challengeCounter.count
      }
    }),
})
