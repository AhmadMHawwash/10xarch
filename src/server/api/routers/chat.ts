import challenges from "@/content/challenges";
import { CHAT_SYSTEM_PROMPT, openai } from '@/lib/openai';
import { authenticatedChatMessagesLimiter, chatMessagesLimiter, enforceRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { calculateGPTCost, calculateTextTokens, costToCredits } from "@/lib/tokens";
import { chatMessageSchema, checkAndLogPromptInjection, containsSensitiveContent, sanitizeInput } from "@/lib/validations/chat";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { credits } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
    .mutation(async ({ ctx, input }) => {
      const { message: rawMessage, challengeId, stageIndex, history, solution } = input;
      
      // Get user identity for tracking and rate limits
      const { userId } = await auth();
      
      // Get IP address for security logging and rate limiting
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? null;
      
      // Sanitize user message to prevent XSS and other attacks  
      const sanitizedMessage = sanitizeInput(rawMessage);
      
      // Check for prompt injection attempts and throw error if detected
      const hasPromptInjection = checkAndLogPromptInjection(
        sanitizedMessage, 
        userId as string | undefined, 
        ipAddress,
        '/api/trpc/chat.sendMessage'
      );
      
      if (hasPromptInjection) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your message contains disallowed patterns",
        });
      }
      
      // Check for potentially harmful content
      if (containsSensitiveContent(sanitizedMessage)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your message contains content that violates our usage policies.',
        });
      }

      // Validate challenge and stage index
      const challenge = challenges.find((c) => c.slug === challengeId);
      if (!challenge) {
        throw new TRPCError({
          code: "BAD_REQUEST", 
          message: "Invalid challenge ID"
        });
      }
      
      if (stageIndex < 0 || stageIndex >= challenge.stages.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid stage index",
        });
      }
      
      const currentStage = challenge.stages[stageIndex];
      
      // Get stage info (simple approach)
      const stageName = `Stage ${stageIndex + 1}`;
        
      // Prepare challenge context for the assistant
      const challengeContext = `
You are assisting with the "${challenge.title}" challenge, currently at stage ${stageIndex + 1}: "${stageName}".

Requirements for this stage:
${currentStage?.requirements?.map(req => `- ${req}`).join('\n') ?? 'No requirements specified'}

Meta Requirements:
${currentStage?.metaRequirements?.map(req => `- ${req}`).join('\n') ?? 'No meta requirements specified'}

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

      // Create identifier for rate limiting
      const identifier = getRateLimitIdentifier(ipAddress, userId);
      
      let rateLimit = { success: true, remaining: 0, reset: 0 };
      
      try {
        // Select appropriate rate limiter based on authentication status
        const limiter = userId ? authenticatedChatMessagesLimiter : chatMessagesLimiter;
        
        // Apply rate limit with enhanced error handling
        rateLimit = await enforceRateLimit({
          limiter,
          identifier: `${identifier}:${challengeId}`,
          userId: userId,
          ipAddress,
          endpoint: '/api/trpc/chat.sendMessage',
          errorMessage: 'Rate limit exceeded for chat messages',
          limitType: 'chat_messages',
          metadata: {
            challengeId
          }
        });
      } catch (error) {
        // If user is authenticated, try using credits instead of stopping
        if (userId) {
          // We'll continue and handle with credits below
        } else {
          // For anonymous users, simply throw the rate limit error
          throw error;
        }
      }
      
      // Pre-validate all history messages to prevent prompt injection
      const sanitizedHistory = history.map(msg => {
        if (msg.role === 'user') {
          const sanitizedContent = sanitizeInput(msg.content);
          
          // Check history messages for prompt injection
          checkAndLogPromptInjection(
            sanitizedContent, 
            userId as string | undefined, 
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
      
      // Prepare messages array for token calculation and API call
      const messageArray = [
        { role: 'system' as const, content: CHAT_SYSTEM_PROMPT },
        { role: 'system' as const, content: challengeContext },
        ...sanitizedHistory,
        { role: 'user' as const, content: sanitizedMessage }
      ];
      
      // Calculate input tokens
      const inputTokens = messageArray.reduce((acc, msg) => {
        return acc + calculateTextTokens(msg.content)
      }, 0);
      
      // If rate limit exceeded and user is signed in, try to use credits
      if (!rateLimit.success && userId) {
        const userCredits = await ctx.db.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });

        // Calculate credit cost based on tokens and model
        const tokenCost = calculateGPTCost(inputTokens, 400, 'gpt-4o-mini'); // 400 tokens is our max for chat completion
        const requiredCredits = costToCredits(tokenCost);

        if (!userCredits || userCredits.balance < requiredCredits) {
          // No credits available, throw rate limit error
          const secondsUntilReset = Math.ceil((rateLimit.reset - Date.now()) / 1000);
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limit exceeded. Try again in ${secondsUntilReset} seconds, or purchase credits.`,
          });
        }

        // NOTE: We will deduct credits AFTER successful API call
      } else if (!rateLimit.success) {
        const secondsUntilReset = Math.ceil((rateLimit.reset - Date.now()) / 1000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`,
        });
      }
      
      // Using free prompts or credits
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messageArray,
        temperature: 0.1,
        max_tokens: 400,
      });

      const response = completion.choices[0]?.message?.content ?? 'No response generated.';
      const outputTokens = calculateTextTokens(response);

      // Calculate the actual cost for this API call
      const totalCost = calculateGPTCost(inputTokens, outputTokens, 'gpt-4o-mini');
      const actualCredits = costToCredits(totalCost);

      // Now deduct credits if we're using them (after successful API call)
      if (!rateLimit.success && userId) {
        const userCredits = await ctx.db.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });
        
        if (userCredits) {
          await ctx.db.update(credits).set({
            balance: userCredits.balance - actualCredits,
            updatedAt: new Date()
          }).where(eq(credits.userId, userId));
        }
      }

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
        remainingMessages: rateLimit.remaining,
        credits: creditsBalance,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          cost: totalCost // Use the calculated cost
        }
      };
    })
});
