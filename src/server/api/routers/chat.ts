import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'
import { TRPCError } from '@trpc/server'
import { chatMessagesLimiter } from '@/lib/rate-limit'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { credits } from '@/server/db/schema'
import { calculateTextTokens, costToCredits, calculateGPTCost } from '@/lib/tokens'

export const chatRouter = createTRPCRouter({
  getRemainingPrompts: publicProcedure
    .input(z.object({ challengeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = await auth();
      const identifier = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1"
      const { remaining, reset } = await chatMessagesLimiter.getRemaining(
        `${identifier}:${input.challengeId}`
      )

      // If user is signed in, check their credits
      let creditsBalance = 0;
      if (userId) {
        const userCredits = await ctx.db.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });
        creditsBalance = userCredits?.balance ?? 0;
      }

      return {
        remaining,
        reset,
        limit: 10,
        credits: creditsBalance,
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
      const { userId } = await auth();
      const identifier = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1"

      // Check rate limit for free prompts
      const { success, reset, remaining } = await chatMessagesLimiter.limit(
        `${identifier}:${challengeId}`
      )
      
      // Prepare messages for OpenAI
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history,
        { role: 'user' as const, content: message },
      ]

      // Calculate input tokens
      const inputTokens = messages.reduce((acc, msg) => {
        return acc + calculateTextTokens(msg.content)
      }, 0)

      // If rate limit exceeded and user is signed in, try to use credits
      if (!success && userId) {
        const userCredits = await ctx.db.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });

        // Calculate maximum possible cost (assuming max output tokens)
        const maxCost = costToCredits(calculateGPTCost(inputTokens, 100)); // 100 is max_tokens

        if (!userCredits || userCredits.balance < maxCost) {
          const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000)
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `You've used all your free prompts and don't have enough credits (need ${maxCost}). Free prompts reset in ${Math.ceil(secondsUntilReset / 60)} minutes.`
          })
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: messages.map(({ role, content }) => ({ role, content })),
          temperature: 0.1,
          max_tokens: 100,
        })

        const response = completion.choices[0]?.message?.content ?? 'No response generated.'
        
        // Calculate actual cost based on usage
        const outputTokens = calculateTextTokens(response)
        const actualCost = costToCredits(calculateGPTCost(inputTokens, outputTokens));

        // Use credits
        const [updatedCredits] = await ctx.db
          .update(credits)
          .set({ 
            balance: userCredits.balance - actualCost,
            updatedAt: new Date()
          })
          .where(eq(credits.userId, userId))
          .returning();

        if (!updatedCredits) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update credits',
          })
        }

        return {
          message: response,
          remainingMessages: remaining,
          credits: updatedCredits.balance,
          tokensUsed: {
            input: inputTokens,
            output: outputTokens,
            cost: actualCost
          }
        }
      } else if (!success) {
        const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000)
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(secondsUntilReset / 60)} minutes or sign in to use credits.`
        })
      }

      // Using free prompts
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: 0.1,
        max_tokens: 100,
      })

      const response = completion.choices[0]?.message?.content ?? 'No response generated.'

      // Get updated credits if user is signed in
      let creditsBalance = 0;
      if (userId) {
        const userCredits = await ctx.db.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });
        creditsBalance = userCredits?.balance ?? 0;
      }

      const outputTokens = calculateTextTokens(response)
      return {
        message: response,
        remainingMessages: remaining,
        credits: creditsBalance,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          cost: 0 // Free prompt
        }
      }
    })
})
