import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { openai, CHAT_SYSTEM_PROMPT } from '@/lib/openai'
import { TRPCError } from '@trpc/server'
import { chatMessagesLimiter } from '@/lib/rate-limit'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { credits } from '@/server/db/schema'
import { calculateTextTokens, costToCredits, calculateGPTCost } from '@/lib/tokens'
import challenges from "@/content/challenges"
import { 
  chatMessageSchema, 
  containsSensitiveContent, 
  sanitizeInput,
  checkAndLogPromptInjection 
} from '@/lib/validations/chat'
import { logSecurityEvent } from '@/lib/security-logger'

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
    .input(chatMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { message: rawMessage, challengeId, stageIndex, history, solution } = input
      const { userId } = await auth();
      
      // Get IP address for security logging and convert to string | null
      const ipAddress = ctx.headers.get("x-forwarded-for");
      const clientIp = ipAddress ? ipAddress : "127.0.0.1"; // Use fallback only for rate limiting
      
      // Apply sanitization to user message
      const message = sanitizeInput(rawMessage);
      
      // Check for potential prompt injection attempt (and log it)
      if (checkAndLogPromptInjection(message, userId ?? undefined, ipAddress, '/api/trpc/chat.sendMessage')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your message contains patterns that violate our usage policies.',
        });
      }
      
      // Check for potentially harmful content
      if (containsSensitiveContent(message)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your message contains content that violates our usage policies.',
        });
      }

      // Get challenge context
      const challenge = challenges.find((c) => c.slug === challengeId);
      if (!challenge) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Challenge not found',
        })
      }

      // Get current stage
      const currentStage = challenge.stages[stageIndex]
      if (!currentStage) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid stage index',
        })
      }

      const challengeContext = `
You are helping with the "${challenge.title}" challenge (${challenge.difficulty} difficulty).

Current stage (${stageIndex + 1}/${challenge.stages.length}):
${currentStage.problem}

Requirements:
${currentStage.requirements.map(req => `- ${req}`).join('\n')}

Meta Requirements:
${currentStage.metaRequirements.map(req => `- ${req}`).join('\n')}

${solution ? `
Current Solution State:
- Components: ${solution.components.length} components defined
${solution.apiDefinitions?.length ? `- API Definitions: ${solution.apiDefinitions.length} endpoints defined` : ''}
${solution.capacityEstimations?.traffic ? `- Traffic Estimation: ${solution.capacityEstimations.traffic}` : ''}
${solution.capacityEstimations?.storage ? `- Storage Estimation: ${solution.capacityEstimations.storage}` : ''}
${solution.capacityEstimations?.bandwidth ? `- Bandwidth Estimation: ${solution.capacityEstimations.bandwidth}` : ''}
${solution.capacityEstimations?.memory ? `- Memory Estimation: ${solution.capacityEstimations.memory}` : ''}
${solution.functionalRequirements ? `- Functional Requirements: ${solution.functionalRequirements}` : ''}
${solution.nonFunctionalRequirements ? `- Non-Functional Requirements: ${solution.nonFunctionalRequirements}` : ''}
` : ''}

Keep these requirements in mind when providing assistance. Guide the user without giving direct solutions.
`

      // Check rate limit for free prompts
      const { success, reset, remaining } = await chatMessagesLimiter.limit(
        `${clientIp}:${challengeId}`
      )
      
      // Log rate limit events
      if (!success) {
        logSecurityEvent({
          eventType: 'rate-limit-exceeded',
          message: 'Rate limit exceeded for chat messages',
          userId: userId ?? undefined,
          ipAddress: ipAddress ?? undefined,
          endpoint: '/api/trpc/chat.sendMessage',
          metadata: {
            limitType: 'chat_messages',
            challengeId
          }
        });
      }
      
      // Pre-validate all history messages to prevent prompt injection
      const sanitizedHistory = history.map(msg => {
        if (msg.role === 'user') {
          const sanitizedContent = sanitizeInput(msg.content);
          
          // Check history messages for prompt injection
          checkAndLogPromptInjection(
            sanitizedContent, 
            userId ?? undefined, 
            ipAddress, 
            '/api/trpc/chat.sendMessage/history'
          );
          
          return {
            role: msg.role,
            content: sanitizedContent
          };
        }
        return msg;
      });
      
      // Prepare messages for OpenAI with challenge context
      const messages = [
        { role: 'system' as const, content: CHAT_SYSTEM_PROMPT },
        { role: 'system' as const, content: challengeContext },
        ...sanitizedHistory,
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
          model: 'gpt-4o-mini',
          messages: messages.map(({ role, content }) => ({ role, content })),
          temperature: 0.1,
          max_tokens: 400,
        })

        const response = completion.choices[0]?.message?.content ?? 'No response generated.'
        const outputTokens = calculateTextTokens(response)
        const actualCost = costToCredits(calculateGPTCost(inputTokens, outputTokens));

        // Check if response is system design related by looking for the disclaimer
        const isSystemDesignRelated = !response.includes("Sorry, I can't help with that. I specialise in system design.");

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
          isSystemDesignRelated,
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
        model: 'gpt-4o-mini',
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: 0.1,
        max_tokens: 400,
      })

      const response = completion.choices[0]?.message?.content ?? 'No response generated.'
      const outputTokens = calculateTextTokens(response)

      // Check if response is system design related by looking for the disclaimer
      const isSystemDesignRelated = !response.includes("Sorry, I can't help with that. I specialise in system design.");

      // Get updated credits if user is signed in
      let creditsBalance = 0;
      if (userId) {
        const userCredits = await ctx.db.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });
        creditsBalance = userCredits?.balance ?? 0;
      }

      return {
        message: response,
        isSystemDesignRelated,
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
