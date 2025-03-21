import challenges from "@/content/challenges";
import { freeChallengesLimiter } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import {
  challengeSolutionSchema,
  sanitizePrompt
} from "@/lib/validations/challenge";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { credits } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkSolution } from "./checkAnswer";

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

  submit: publicProcedure
    .input(challengeSolutionSchema)
    .mutation(async ({ ctx, input }) => {
      // Get user info for security logging
      const { userId } = await auth();
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? null;
      
      // Get the challenge
      const challenge = challenges.find((c) => c.slug === input.challengeSlug);

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      // Sanitize the prompt to prevent injection attacks and log any attempt
      const sanitizedPrompt = sanitizePrompt(
        input.challengeAndSolutionPrompt,
        userId ?? undefined,
        ipAddress,
        `/api/challenges/${input.challengeSlug}`
      );
      
      // Check length after sanitization to avoid processing extremely large inputs
      if (sanitizedPrompt.length < 10) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Solution is too short after sanitization",
        });
      }

      // Get identifier for rate limiting
      const identifier =
        userId ?? ctx.headers.get("x-forwarded-for") ?? "127.0.0.1";

      const { remaining } =
        await freeChallengesLimiter.getRemaining(identifier);

      // Handle free challenges (both anonymous and authenticated users)
      if (challenge.isFree && remaining > 0) {
        const response = await freeChallengesLimiter.limit(identifier);

        if (!response.success) {
          const resetDate = new Date(response.reset);
          const formattedTime = resetDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          // Log the rate limit exceeded event
          logSecurityEvent({
            eventType: 'rate-limit-exceeded',
            message: `Challenge submission rate limit exceeded`,
            userId: userId ?? undefined,
            ipAddress: ipAddress ?? undefined,
            endpoint: `/api/challenges/${input.challengeSlug}`,
            metadata: {
              limitType: "challenge-submissions",
              reset: response.reset,
              challengeId: input.challengeSlug
            }
          });

          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limit exceeded. You can try again at ${formattedTime}`,
          });
        }

        // Process free challenge submission with sanitized prompt
        const aiCaller = createAICaller(ctx);
        const result = await aiCaller.hello({
          challengeSlug: input.challengeSlug,
          criteria: input.criteria,
          challengeAndSolutionPrompt: sanitizedPrompt,
          bypassInternalToken: process.env.BYPASS_TOKEN,
        });

        return { success: true, evaluation: result };
      }

      // Handle paid challenges (must be authenticated)
      if (!userId) {
        // Log the unauthorized access attempt
        logSecurityEvent({
          eventType: 'unauthorized-access',
          message: `Unauthorized attempt to access paid challenge`,
          ipAddress: ipAddress ?? undefined,
          endpoint: `/api/challenges/${input.challengeSlug}`,
          metadata: {
            challengeId: input.challengeSlug
          }
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
          eventType: 'rate-limit-exceeded',
          message: `User has insufficient credits`,
          userId,
          ipAddress: ipAddress ?? undefined,
          endpoint: `/api/challenges/${input.challengeSlug}`,
          metadata: {
            limitType: "credits",
            challengeId: input.challengeSlug,
            currentBalance: userCredits?.balance ?? 0
          }
        });

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need to purchase credits to submit this challenge",
        });
      }

      // Deduct 1 credit for paid challenge submission
      await ctx.db
        .update(credits)
        .set({ balance: userCredits.balance - 1 })
        .where(eq(credits.userId, userId));

      // Process submission
      const aiCaller = createAICaller(ctx);
      const result = await aiCaller.hello({
        challengeSlug: input.challengeSlug,
        criteria: input.criteria,
        challengeAndSolutionPrompt: sanitizedPrompt,
        bypassInternalToken: process.env.BYPASS_TOKEN,
      });

      return { success: true, evaluation: result };
    }),
});
