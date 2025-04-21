import challenges from "@/content/challenges";
import { CHAT_SYSTEM_PROMPT, openai } from '@/lib/openai';
import { authenticatedFreeChatMessagesLimiter, chatMessagesLimiter, enforceRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { calculateGPTCost, calculateTextTokens, costToCredits } from "@/lib/tokens";
import { chatMessageSchema, checkAndLogPromptInjection, containsSensitiveContent, sanitizeInput } from "@/lib/validations/chat";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { credits } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Add these interfaces at the top of the file, after imports

// Type definitions for components and connections
interface Component {
  id: string;
  type?: string;
  name?: string;
  description?: string;
  config?: unknown;
  position?: unknown;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: unknown;
}

export const chatRouter = createTRPCRouter({
  getRemainingPrompts: publicProcedure
    .input(z.object({ 
      challengeId: z.string(),
      isPlayground: z.boolean().optional(),
      playgroundId: z.string().optional()
     }))
    .query(async ({ input, ctx }) => {
      const { userId } = await auth();
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1";
      
      // Create identifier using the shared utility function
      const identifier = getRateLimitIdentifier(ipAddress, userId);
      
      // Use the same rate limit key construction as sendMessage
      const rateLimitKey = input.isPlayground
        ? `${identifier}:playground:${input.playgroundId ?? 'default'}`
        : `${identifier}:${input.challengeId}`;
      
      // Get remaining free prompts (for both authenticated and unauthenticated users)
      const limiter = userId ? authenticatedFreeChatMessagesLimiter : chatMessagesLimiter;
      const { remaining, reset } = await limiter.getRemaining(rateLimitKey);
      
      // If user is signed in, also check their credits
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
        limit: 3,
        credits: creditsBalance,
      }
    }),

  sendMessage: publicProcedure
    .input(chatMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { message: rawMessage, challengeId, stageIndex, history, solution, isPlayground, playgroundId, playgroundTitle } = input;
      
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

      // Determine context based on whether this is a playground or challenge chat
      let contextMessage = '';
      
      if (isPlayground) {
        // Playground mode context
        contextMessage = `
You are assisting with a system design playground titled "${playgroundTitle ?? 'Untitled Design'}".

${solution ? `
Current Solution State:
- Components: ${solution.components.length} components defined
${solution.edges?.length ? `- Connections: ${solution.edges.length} connections between components` : ''}
${solution.apiDefinitions?.length ? `- API Definitions: ${solution.apiDefinitions.length} endpoints defined` : ''}
${solution.capacityEstimations?.traffic ? `- Traffic Estimation: ${solution.capacityEstimations.traffic}` : ''}
${solution.capacityEstimations?.storage ? `- Storage Estimation: ${solution.capacityEstimations.storage}` : ''}
${solution.capacityEstimations?.bandwidth ? `- Bandwidth Estimation: ${solution.capacityEstimations.bandwidth}` : ''}
${solution.capacityEstimations?.memory ? `- Memory Estimation: ${solution.capacityEstimations.memory}` : ''}
${solution.functionalRequirements ? `- Functional Requirements: ${solution.functionalRequirements}` : ''}
${solution.nonFunctionalRequirements ? `- Non-Functional Requirements: ${solution.nonFunctionalRequirements}` : ''}

${solution.components.length > 0 ? `
Component Details:
${solution.components.map((component: Component, index: number) => 
  `Component ${index + 1}: ${component.name ?? component.type ?? 'Unnamed Component'}${
    component.description ? `\n  Description: ${component.description}` : ''
  }${
    component.config ? `\n  Configuration: ${typeof component.config === 'string' ? component.config : JSON.stringify(component.config)}` : ''
  }`
).join('\n\n')}
` : ''}

${solution.edges && solution.edges.length > 0 ? `
Connection Details:
${solution.edges.map((edge: Edge, index: number) => 
  `Connection ${index + 1}: ${edge.source} → ${edge.target}${
    edge.label ? `\n  Label: ${edge.label}` : ''
  }${
    edge.data ? `\n  Data: ${typeof edge.data === 'string' ? edge.data : JSON.stringify(edge.data)}` : ''
  }`
).join('\n\n')}
` : ''}
` : ''}

Provide guidance on system design best practices. Help the user think through their design decisions, 
suggest alternatives where appropriate, and point out potential issues or improvements. Pay special 
attention to how components are connected and the data flow between them.
`;
      } else {
        // Challenge mode - requires valid challenge and stage
        const challenge = challenges.find((c) => c.slug === challengeId);
        if (!challenge) {
          throw new TRPCError({
            code: "BAD_REQUEST", 
            message: "Invalid challenge ID"
          });
        }
        
        if (stageIndex === undefined || stageIndex < 0 || stageIndex >= challenge.stages.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid stage index",
          });
        }
        
        const currentStage = challenge.stages[stageIndex];
        
        // Get stage info (simple approach)
        const stageName = `Stage ${stageIndex + 1}`;
          
        // Prepare challenge context for the assistant
        contextMessage = `
You are assisting with the "${challenge.title}" challenge, currently at stage ${stageIndex + 1}: "${stageName}".

Requirements for this stage:
${currentStage?.requirements?.map(req => `- ${req}`).join('\n') ?? 'No requirements specified'}

Meta Requirements:
${currentStage?.metaRequirements?.map(req => `- ${req}`).join('\n') ?? 'No meta requirements specified'}

${solution ? `
Current Solution State:
- Components: ${solution.components.length} components defined
${solution.edges?.length ? `- Connections: ${solution.edges.length} connections between components` : ''}
${solution.apiDefinitions?.length ? `- API Definitions: ${solution.apiDefinitions.length} endpoints defined` : ''}
${solution.capacityEstimations?.traffic ? `- Traffic Estimation: ${solution.capacityEstimations.traffic}` : ''}
${solution.capacityEstimations?.storage ? `- Storage Estimation: ${solution.capacityEstimations.storage}` : ''}
${solution.capacityEstimations?.bandwidth ? `- Bandwidth Estimation: ${solution.capacityEstimations.bandwidth}` : ''}
${solution.capacityEstimations?.memory ? `- Memory Estimation: ${solution.capacityEstimations.memory}` : ''}
${solution.functionalRequirements ? `- Functional Requirements: ${solution.functionalRequirements}` : ''}
${solution.nonFunctionalRequirements ? `- Non-Functional Requirements: ${solution.nonFunctionalRequirements}` : ''}

${solution.components.length > 0 ? `
Component Details:
${solution.components.map((component: Component, index: number) => 
  `Component ${index + 1}: ${component.name ?? component.type ?? 'Unnamed Component'}${
    component.description ? `\n  Description: ${component.description}` : ''
  }${
    component.config ? `\n  Configuration: ${typeof component.config === 'string' ? component.config : JSON.stringify(component.config)}` : ''
  }`
).join('\n\n')}
` : ''}

${solution.edges && solution.edges.length > 0 ? `
Connection Details:
${solution.edges.map((edge: Edge, index: number) => 
  `Connection ${index + 1}: ${edge.source} → ${edge.target}${
    edge.label ? `\n  Label: ${edge.label}` : ''
  }${
    edge.data ? `\n  Data: ${typeof edge.data === 'string' ? edge.data : JSON.stringify(edge.data)}` : ''
  }`
).join('\n\n')}
` : ''}
` : ''}

Keep these requirements in mind when providing assistance. Guide the user without giving direct solutions.
`;
      }

      // Create identifier using the shared utility function
      const identifier = getRateLimitIdentifier(ipAddress, userId);
      
      // Define a rate limit key based on mode
      const rateLimitKey = isPlayground 
        ? `${identifier}:playground:${playgroundId ?? 'default'}`
        : `${identifier}:${challengeId}`;
      
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
        { role: 'system' as const, content: contextMessage },
        ...sanitizedHistory,
        { role: 'user' as const, content: sanitizedMessage }
      ];
      
      // Calculate input tokens
      const inputTokens = messageArray.reduce((acc, msg) => {
        return acc + calculateTextTokens(msg.content)
      }, 0);
      
      // Initialize rate limit info
      let rateLimit = { success: true, remaining: 0, reset: 0 };
      let useCredits = false;
      
      try {
        // Check rate limits for both authenticated and unauthenticated users
        const limiter = userId ? authenticatedFreeChatMessagesLimiter : chatMessagesLimiter;
        rateLimit = await enforceRateLimit({
          limiter,
          identifier: rateLimitKey,
          userId: userId,
          ipAddress,
          endpoint: '/api/trpc/chat.sendMessage',
          errorMessage: 'Rate limit exceeded for chat messages',
          limitType: 'chat_messages',
          metadata: {
            mode: isPlayground ? 'playground' : 'challenge',
            contextId: isPlayground ? playgroundId : challengeId
          }
        });
      } catch (error) {
        // If authenticated user has hit their free limit, try to use credits
        if (userId) {
          useCredits = true;
          
          // Check if user has sufficient credits
          const userCredits = await ctx.db.query.credits.findFirst({
            where: eq(credits.userId, userId),
          });
          
          // Calculate estimated cost
          const estimatedCost = calculateGPTCost(inputTokens, 400, 'gpt-4.1-mini');
          const requiredCredits = costToCredits(estimatedCost);
          
          if (!userCredits || userCredits.balance < requiredCredits) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `You've used all your free messages and don't have enough credits. You need at least ${requiredCredits} credits. Current balance: ${userCredits?.balance ?? 0}`,
            });
          }
        } else {
          // Unauthenticated users can't bypass rate limits with credits
          throw error;
        }
      }
      
      // Using free prompts or credits based on rate limit
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: messageArray,
        temperature: 0.1,
        max_tokens: 400,
      });

      const response = completion.choices[0]?.message?.content ?? 'No response generated.';
      const outputTokens = calculateTextTokens(response);

      // Calculate the actual cost for this API call
      const totalCost = calculateGPTCost(inputTokens, outputTokens, 'gpt-4.1-mini');
      const actualCredits = costToCredits(totalCost);

      // Deduct credits only if we're using them (rate limit was exceeded)
      if (useCredits && userId) {
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
