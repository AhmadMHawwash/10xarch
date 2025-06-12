import challenges from "@/content/challenges";
import { CHAT_SYSTEM_PROMPT, openai } from "@/lib/openai";
import {
  authenticatedFreeChatMessagesLimiter,
  chatMessagesLimiter,
  enforceRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";
import {
  calculateGPTCost,
  calculateTextTokens,
  costToCredits,
} from "@/lib/tokens";
import {
  chatMessageSchema,
  checkAndLogPromptInjection,
  containsSensitiveContent,
  sanitizeInput,
} from "@/lib/validations/chat";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { tokenBalances } from "@/server/db/schema";
import { deductTokensFromAccount } from "@/lib/tokens-server";

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
    .input(
      z.object({
        challengeId: z.string(),
        isPlayground: z.boolean().optional(),
        playgroundId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId, orgId } = await auth();
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1";

      // Make rate limiting per-account per user (personal vs each org)
      const contextSuffix = orgId ? `org:${orgId}` : "personal";
      const baseIdentifier = getRateLimitIdentifier(ipAddress, userId);
      const identifier = `${baseIdentifier}:${contextSuffix}`;

      // Use the same rate limit key construction as sendMessage
      const rateLimitKey = input.isPlayground
        ? `${identifier}:playground`
        : `${identifier}`;

      // Get remaining free prompts (for both authenticated and unauthenticated users)
      const limiter = userId
        ? authenticatedFreeChatMessagesLimiter
        : chatMessagesLimiter;
      const { remaining, reset } = await limiter.getRemaining(rateLimitKey);

      // If user is signed in, get their token balance based on current context
      let tokenBalance = null;
      if (userId) {
        // Determine current context (org or personal)
        const ownerType = orgId ? "org" : "user";
        const ownerId = orgId ?? userId;

        const balance = await ctx.db.query.tokenBalances.findFirst({
          where: and(
            eq(tokenBalances.ownerType, ownerType),
            eq(tokenBalances.ownerId, ownerId),
          ),
        });

        tokenBalance = balance
          ? {
              expiringTokens: balance.expiringTokens,
              expiringTokensExpiry: balance.expiringTokensExpiry,
              nonexpiringTokens: balance.nonexpiringTokens,
              totalTokens: balance.expiringTokens + balance.nonexpiringTokens,
            }
          : {
              expiringTokens: 0,
              expiringTokensExpiry: null,
              nonexpiringTokens: 0,
              totalTokens: 0,
            };
      }

      return {
        remaining,
        reset,
        limit: 3,
        tokenBalance,
      };
    }),

  sendMessage: publicProcedure
    .input(chatMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        message: rawMessage,
        challengeId,
        stageIndex,
        history,
        solution,
        isPlayground,
        playgroundId,
        playgroundTitle,
      } = input;

      // Get user identity for tracking and rate limits
      const { userId, orgId } = await auth();

      // Get IP address for security logging and rate limiting
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? null;

      // Sanitize user message to prevent XSS and other attacks
      const sanitizedMessage = sanitizeInput(rawMessage);

      // Check for prompt injection attempts and throw error if detected
      const hasPromptInjection = checkAndLogPromptInjection(
        sanitizedMessage,
        userId as string | undefined,
        ipAddress,
        "/api/trpc/chat.sendMessage",
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
          code: "BAD_REQUEST",
          message:
            "Your message contains content that violates our usage policies.",
        });
      }

      // Determine context based on whether this is a playground or challenge chat
      let contextMessage = "";

      if (isPlayground) {
        // Playground mode context
        contextMessage = `
You are assisting with a system design playground titled "${playgroundTitle ?? "Untitled Design"}".

${
  solution
    ? `
Current Solution State:
- Components: ${solution.components.length} components defined
${solution.edges?.length ? `- Connections: ${solution.edges.length} connections between components` : ""}
${solution.apiDefinitions?.length ? `- API Definitions: ${solution.apiDefinitions.length} endpoints defined` : ""}
${solution.capacityEstimations?.traffic ? `- Traffic Estimation: ${solution.capacityEstimations.traffic}` : ""}
${solution.capacityEstimations?.storage ? `- Storage Estimation: ${solution.capacityEstimations.storage}` : ""}
${solution.capacityEstimations?.bandwidth ? `- Bandwidth Estimation: ${solution.capacityEstimations.bandwidth}` : ""}
${solution.capacityEstimations?.memory ? `- Memory Estimation: ${solution.capacityEstimations.memory}` : ""}
${solution.functionalRequirements ? `- Functional Requirements: ${solution.functionalRequirements}` : ""}
${solution.nonFunctionalRequirements ? `- Non-Functional Requirements: ${solution.nonFunctionalRequirements}` : ""}

${
  solution.components.length > 0
    ? `
Component Details:
${solution.components
  .map(
    (component: Component, index: number) =>
      `Component ${index + 1}: ${component.name ?? component.type ?? "Unnamed Component"}${
        component.description ? `\n  Description: ${component.description}` : ""
      }${
        component.config
          ? `\n  Configuration: ${typeof component.config === "string" ? component.config : JSON.stringify(component.config)}`
          : ""
      }`,
  )
  .join("\n\n")}
`
    : ""
}

${
  solution.edges && solution.edges.length > 0
    ? `
Connection Details:
${solution.edges
  .map(
    (edge: Edge, index: number) =>
      `Connection ${index + 1}: ${edge.source} → ${edge.target}${
        edge.label ? `\n  Label: ${edge.label}` : ""
      }${
        edge.data
          ? `\n  Data: ${typeof edge.data === "string" ? edge.data : JSON.stringify(edge.data)}`
          : ""
      }`,
  )
  .join("\n\n")}
`
    : ""
}
`
    : ""
}

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
            message: "Invalid challenge ID",
          });
        }

        if (
          stageIndex === undefined ||
          stageIndex < 0 ||
          stageIndex >= challenge.stages.length
        ) {
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
${currentStage?.requirements?.map((req) => `- ${req}`).join("\n") ?? "No requirements specified"}

Meta Requirements:
${currentStage?.metaRequirements?.map((req) => `- ${req}`).join("\n") ?? "No meta requirements specified"}

${
  solution
    ? `
Current Solution State:
${solution.title ? `- Title: ${solution.title}` : ""}
${solution.description ? `- Description: ${solution.description}` : ""}
- Components: ${solution.components.length} components defined
${solution.edges?.length ? `- Connections: ${solution.edges.length} connections between components` : ""}
${solution.apiDefinitions?.length ? `- API Definitions: ${solution.apiDefinitions.length} endpoints defined` : ""}
${solution.capacityEstimations?.traffic ? `- Traffic Estimation: ${solution.capacityEstimations.traffic}` : ""}
${solution.capacityEstimations?.storage ? `- Storage Estimation: ${solution.capacityEstimations.storage}` : ""}
${solution.capacityEstimations?.bandwidth ? `- Bandwidth Estimation: ${solution.capacityEstimations.bandwidth}` : ""}
${solution.capacityEstimations?.memory ? `- Memory Estimation: ${solution.capacityEstimations.memory}` : ""}
${solution.functionalRequirements ? `- Functional Requirements: ${solution.functionalRequirements}` : ""}
${solution.nonFunctionalRequirements ? `- Non-Functional Requirements: ${solution.nonFunctionalRequirements}` : ""}

${
  solution.components.length > 0
    ? `
Component Details:
${solution.components
  .map(
    (component: Component, index: number) =>
      `Component ${index + 1}: ${component.name ?? component.type ?? "Unnamed Component"}${
        component.description ? `\n  Description: ${component.description}` : ""
      }${
        component.config
          ? `\n  Configuration: ${typeof component.config === "string" ? component.config : JSON.stringify(component.config)}`
          : ""
      }`,
  )
  .join("\n\n")}
`
    : ""
}

${
  solution.edges && solution.edges.length > 0
    ? `
Connection Details:
${solution.edges
  .map(
    (edge: Edge, index: number) =>
      `Connection ${index + 1}: ${edge.source} → ${edge.target}${
        edge.label ? `\n  Label: ${edge.label}` : ""
      }${
        edge.data
          ? `\n  Data: ${typeof edge.data === "string" ? edge.data : JSON.stringify(edge.data)}`
          : ""
      }`,
  )
  .join("\n\n")}
`
    : ""
}
`
    : ""
}

Keep these requirements in mind when providing assistance. Guide the user without giving direct solutions.
`;
      }

      // Make rate limiting per-account per user (personal vs each org)
      const contextSuffix = orgId ? `org:${orgId}` : "personal";
      const baseIdentifier = getRateLimitIdentifier(ipAddress, userId);
      const identifier = `${baseIdentifier}:${contextSuffix}`;

      // Use the same rate limit key construction as sendMessage
      const rateLimitKey = input.isPlayground
        ? `${identifier}:playground`
        : `${identifier}`;

      // Pre-validate all history messages to prevent prompt injection
      const sanitizedHistory = history.map((msg) => {
        if (msg.role === "user") {
          const sanitizedContent = sanitizeInput(msg.content);

          // Check history messages for prompt injection
          checkAndLogPromptInjection(
            sanitizedContent,
            userId as string | undefined,
            ipAddress,
            "/api/trpc/chat.sendMessage/history",
          );

          return {
            role: msg.role,
            content: sanitizedContent,
          };
        }
        return msg;
      });

      // Prepare messages array for token calculation and API call
      const messageArray = [
        { role: "system" as const, content: CHAT_SYSTEM_PROMPT },
        { role: "system" as const, content: contextMessage },
        ...sanitizedHistory,
        { role: "user" as const, content: sanitizedMessage },
      ];

      // Calculate input tokens
      const inputTokens = messageArray.reduce((acc, msg) => {
        return acc + calculateTextTokens(msg.content);
      }, 0);

      // Initialize tracking variables
      let usedTokens = false;
      let tokensDeducted = 0;
      let remainingMessages = 0;

      try {
        // Try to use free rate limit first
        const limiter = userId
          ? authenticatedFreeChatMessagesLimiter
          : chatMessagesLimiter;

        await enforceRateLimit({
          limiter,
          identifier: rateLimitKey,
          userId,
          ipAddress,
          endpoint: "/api/trpc/chat.sendMessage",
          errorMessage: "Rate limit exceeded for chat messages",
          limitType: "chat_messages",
          metadata: {
            mode: isPlayground ? "playground" : "challenge",
            contextId: isPlayground ? playgroundId : challengeId,
          },
        });

        // If we get here, rate limit was successful - get remaining count
        const { remaining } = await limiter.getRemaining(rateLimitKey);
        remainingMessages = remaining;
      } catch (rateLimitError) {
        // Rate limit exceeded - try to use tokens if user is authenticated
        if (!userId) {
          // Unauthenticated users can't use tokens
          throw rateLimitError;
        }

        // Get current context for token balance
        const ownerType = orgId ? "org" : "user";
        const ownerId = orgId ?? userId;

        // Check if user has sufficient tokens
        const userTokenBalance = await ctx.db.query.tokenBalances.findFirst({
          where: and(
            eq(tokenBalances.ownerType, ownerType),
            eq(tokenBalances.ownerId, ownerId),
          ),
        });

        // Calculate estimated cost based on input tokens (estimate output tokens)
        const estimatedOutputTokens = 400; // Reasonable estimate for chat responses
        const estimatedCost = calculateGPTCost(
          inputTokens,
          estimatedOutputTokens,
          "gpt-4.1-mini",
        );
        const requiredTokens = costToCredits(estimatedCost);

        const totalAvailable =
          (userTokenBalance?.expiringTokens ?? 0) +
          (userTokenBalance?.nonexpiringTokens ?? 0);

        if (!userTokenBalance || totalAvailable < requiredTokens) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You've used all your free messages and don't have enough tokens. You need at least ${requiredTokens} tokens. Current balance: ${totalAvailable}`,
          });
        }

        // Mark that we'll be using tokens
        usedTokens = true;
        tokensDeducted = requiredTokens;
      }

      // Make the API call
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messageArray,
        temperature: 0.1,
        max_tokens: 400,
      });

      const response =
        completion.choices[0]?.message?.content ?? "No response generated.";
      const outputTokens = calculateTextTokens(response);

      // Calculate the actual cost for this API call
      const actualCost = calculateGPTCost(
        inputTokens,
        outputTokens,
        "gpt-4.1-mini",
      );
      const actualTokens = costToCredits(actualCost);

      // Deduct tokens after generation is successful
      if (usedTokens && userId) {
        const result = await deductTokensFromAccount({
          userId,
          orgId,
          tokensUsed: actualTokens,
          reason: "chat",
        });

        tokensDeducted = result.tokensDeducted;
      }

      const isSystemDesignRelated = !response.includes(
        "Sorry, I can't help with that. I specialise in system design.",
      );

      return {
        message: response,
        isSystemDesignRelated,
        remainingMessages,
        tokensUsed: usedTokens
          ? {
              deducted: tokensDeducted,
              input: inputTokens,
              output: outputTokens,
              cost: actualCost,
            }
          : null,
      };
    }),
});
