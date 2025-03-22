import challenges from "@/content/challenges";
import {
  freeChallengesLimiter,
  getRateLimitIdentifier,
  authenticatedChallengesLimiter,
  enforceRateLimit,
} from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import {
  challengeSolutionSchema,
  sanitizePrompt,
} from "@/lib/validations/challenge";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { credits } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { checkSolution } from "./checkAnswer";
import {
  calculateGPTCost,
  calculateTextTokens,
  costToCredits,
} from "@/lib/tokens";

const createAICaller = createCallerFactory(checkSolution);

export const challengesRouter = createTRPCRouter({
  getRateLimitInfo: publicProcedure.query(async ({ ctx }) => {
    const { userId } = await auth();
    const identifier =
      userId ?? ctx.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Use peek() to check rate limit info without consuming a submission
    const { remaining, reset } =
      await freeChallengesLimiter.getRemaining(identifier);

    return {
      remaining,
      reset,
      limit: 5, // Daily submission limit
    };
  }),

  submit: protectedProcedure
    .input(challengeSolutionSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;

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
          // Just throw the error as enforceRateLimit already handles logging
          throw error;
        }
      }

      // Handle paid challenges (must be authenticated)
      if (!userId) {
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

      // Check if user has credits
      const userCredits = await ctx.db.query.credits.findFirst({
        where: eq(credits.userId, userId),
      });

      if (!userCredits || userCredits.balance <= 0) {
        // Log the credit issue
        logSecurityEvent({
          eventType: "insufficient-credits",
          message: `User has insufficient credits`,
          userId,
          ipAddress: ipAddress ?? undefined,
          endpoint: `/api/challenges/${input.challengeSlug}`,
          metadata: {
            limitType: "credits",
            challengeId: input.challengeSlug,
            currentBalance: userCredits?.balance ?? 0,
          },
        });

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need to purchase credits to submit this challenge",
        });
      }

      // Calculate estimated input tokens
      const promptTokens = calculateTextTokens(sanitizedPrompt);
      // Estimate output tokens (max allowed in API call)
      const estimatedOutputTokens = 512;

      // Calculate estimated cost
      const estimatedCost = calculateGPTCost(
        promptTokens,
        estimatedOutputTokens,
        "gpt-4o-mini",
      );
      const estimatedCredits = costToCredits(estimatedCost);

      // Check if user has enough credits for estimated cost
      if (userCredits.balance < estimatedCredits) {
        logSecurityEvent({
          eventType: "insufficient-credits",
          message: `User has insufficient credits for estimated cost`,
          userId,
          ipAddress: ipAddress ?? undefined,
          endpoint: `/api/challenges/${input.challengeSlug}`,
          metadata: {
            limitType: "credits",
            challengeId: input.challengeSlug,
            currentBalance: userCredits.balance,
            requiredCredits: estimatedCredits,
          },
        });

        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You need at least ${estimatedCredits} credits to submit this challenge. Current balance: ${userCredits.balance}`,
        });
      }

      // Process submission (before deducting credits)
      const aiCaller = createAICaller(ctx);
      try {
        const result = await aiCaller.hello({
          challengeSlug: input.challengeSlug,
          criteria: input.criteria,
          challengeAndSolutionPrompt: sanitizedPrompt,
          bypassInternalToken: process.env.BYPASS_TOKEN,
        });

        // Calculate actual tokens used (we have to estimate since the API doesn't return token count)
        const responseText = JSON.stringify(result);
        const outputTokens = calculateTextTokens(responseText);

        // Calculate actual cost
        const actualCost = calculateGPTCost(
          promptTokens,
          outputTokens,
          "gpt-4o-mini",
        );
        const actualCredits = costToCredits(actualCost);

        // Only deduct credits AFTER successful API call
        await ctx.db
          .update(credits)
          .set({
            balance: userCredits.balance - actualCredits,
            updatedAt: new Date(),
          })
          .where(eq(credits.userId, userId));

        return {
          success: true,
          evaluation: result,
        };
      } catch (error) {
        // If API call fails, don't deduct credits and pass the error
        throw error;
      }
    }),
});
