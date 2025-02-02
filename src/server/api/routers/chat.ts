import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'
import { TRPCError } from '@trpc/server'
import { chatMessagesLimiter } from '@/lib/rate-limit'

export const chatRouter = createTRPCRouter({
  getRemainingPrompts: publicProcedure
    .input(z.object({ challengeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const identifier = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1"
      const { remaining, reset } = await chatMessagesLimiter.getRemaining(
        `${identifier}:${input.challengeId}`
      )
      return {
        remaining,
        reset,
        limit: 10, // matches the limit set in rate-limit.ts
      }
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        challengeId: z.string(),
        history: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, challengeId, history } = input
      const identifier = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1"

      // Check rate limit
      const { success, reset, remaining } = await chatMessagesLimiter.limit(
        `${identifier}:${challengeId}`
      )
      
      if (!success) {
        const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000)
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(secondsUntilReset / 60)} minutes.`
        })
      }

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history,
        { role: 'user' as const, content: message },
      ]

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: 0.1,
        max_tokens: 100,
      })

      const response = completion.choices[0]?.message?.content ?? 'No response generated.'

      return {
        message: response,
        remainingMessages: remaining
      }
    })
})
