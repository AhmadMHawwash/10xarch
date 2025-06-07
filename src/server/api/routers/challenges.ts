import challenges from "@/content/challenges";
import {
  authenticatedChallengesLimiter,
  enforceRateLimit,
  freeChallengesLimiter,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import {
  calculateGPTCost,
  calculateTextTokens,
  costToCredits,
} from "@/lib/tokens";
import { deductTokensFromAccount } from "@/lib/tokens-server";
import {
  challengeSolutionSchema,
  sanitizePrompt,
} from "@/lib/validations/challenge";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { checkSolution } from "./checkAnswer";

const createAICaller = createCallerFactory(checkSolution);

export const challengesRouter = createTRPCRouter({
  getChallengesSubmitRateLimitInfo: publicProcedure.query(async ({ ctx }) => {
    const { userId } = await auth();

    const ipAddress = ctx.headers.get("x-forwarded-for") ?? null;

    const identifier = getRateLimitIdentifier(ipAddress, userId);

    const limiter = userId
      ? authenticatedChallengesLimiter
      : freeChallengesLimiter;
    // Use peek() to check rate limit info without consuming a submission
    const { remaining, reset } = await limiter.getRemaining(identifier);

    return {
      remaining,
      reset,
      limit: 5, // Daily submission limit
    };
  }),

  submit: publicProcedure
    .input(challengeSolutionSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId, orgId } = await auth();
      const ownerId = orgId ?? userId;

      // Get the challenge
      const challenge = challenges.find((c) => c.slug === input.challengeSlug);

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      // Get IP address for security logging and rate limiting
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? null;

      // Sanitize prompt to prevent injection
      const sanitizedPrompt = sanitizePrompt(
        input.challengeAndSolutionPrompt,
        userId ?? undefined,
        ipAddress ?? undefined,
        `/api/challenges/${input.challengeSlug}`,
      );

      // Create identifier for rate limiting
      const identifier = getRateLimitIdentifier(ipAddress, userId);

      // Handle free challenges (both anonymous and authenticated users)
      if (challenge.isFree) {
        try {
          // Use our enforce rate limit helper with appropriate limiter based on auth status
          const limiter = userId
            ? authenticatedChallengesLimiter
            : freeChallengesLimiter;

          await enforceRateLimit({
            limiter,
            identifier,
            userId,
            ipAddress,
            endpoint: `/api/challenges/${input.challengeSlug}`,
            errorMessage: "Rate limit exceeded for challenge submissions",
            limitType: "challenge-submissions",
            metadata: {
              challengeId: input.challengeSlug,
            },
          });

          // Process free challenge submission with sanitized prompt
          const aiCaller = createAICaller(ctx);
          const result = await aiCaller.hello({
            challengeSlug: input.challengeSlug,
            criteria: input.criteria,
            challengeAndSolutionPrompt: sanitizedPrompt,
            bypassInternalToken: process.env.BYPASS_TOKEN,
          });

          return { success: true, evaluation: result };
        } catch (error) {
          // throw error if user is not authenticated. Otherwise, just continue
          if (!userId) {
            throw error;
          }
        }
      }

      // Handle paid challenges (must be authenticated)
      if (!ownerId) {
        // Log the unauthorized access attempt
        logSecurityEvent({
          eventType: "unauthorized-access",
          message: `Unauthorized attempt to access paid challenge`,
          ipAddress: ipAddress ?? undefined,
          endpoint: `/api/challenges/${input.challengeSlug}`,
          metadata: {
            challengeId: input.challengeSlug,
          },
        });

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to submit this challenge",
        });
      }

      // Calculate estimated input tokens for logging purposes
      const promptTokens = calculateTextTokens(sanitizedPrompt);

      // Process submission and deduct actual tokens after
      const aiCaller = createAICaller(ctx);
      try {
        const result = await aiCaller.hello({
          challengeSlug: input.challengeSlug,
          criteria: input.criteria,
          challengeAndSolutionPrompt: sanitizedPrompt,
          bypassInternalToken: process.env.BYPASS_TOKEN,
        });
        
        // Calculate actual tokens used
        const responseText = JSON.stringify(result);
        const outputTokens = calculateTextTokens(responseText);
        const actualCost = calculateGPTCost(
          promptTokens,
          outputTokens,
          "gpt-4.1-mini",
        );
        const actualTokens = costToCredits(actualCost);

        // Deduct tokens after successful operation (allows negative balances)
        await deductTokensFromAccount({
          userId: userId!,
          orgId,
          tokensUsed: actualTokens,
          reason: "challenge",
        });

        return {
          success: true,
          evaluation: result,
        };
      } catch (error) {
        // If API call fails, don't deduct tokens and pass the error
        throw error;
      }
    }),
});
