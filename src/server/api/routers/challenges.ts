import challenges from "@/content/challenges";
import { freeChallengesLimiter } from "@/lib/rate-limit";
import { createTRPCRouter, publicProcedure, t } from "@/server/api/trpc";
import { credits } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkSolution } from "./checkAnswer";

const createAICaller = t.createCallerFactory(checkSolution);

const submitChallengeSchema = z.object({
  challengeSlug: z.string(),
  criteria: z.array(z.string()),
  challengeAndSolutionPrompt: z.string(),
});

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
      limit: 15, // Daily submission limit
    };
  }),

  submit: publicProcedure
    .input(submitChallengeSchema)
    .mutation(async ({ ctx, input }) => {
      // Get the challenge
      const challenge = challenges.find((c) => c.slug === input.challengeSlug);

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      const { userId } = await auth();
      const identifier =
        userId ?? ctx.headers.get("x-forwarded-for") ?? "127.0.0.1";

      const { remaining } =
        await freeChallengesLimiter.getRemaining(identifier);

      // Handle free challenges (both anonymous and authenticated users)
      if (challenge.isFree && remaining > 0) {
        // Get client IP or user ID for rate limiting

        const response = await freeChallengesLimiter.limit(identifier);

        if (!response.success) {
          const resetDate = new Date(response.reset);
          const formattedTime = resetDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limit exceeded. You can try again at ${formattedTime}`,
          });
        }

        // Process free challenge submission
        const aiCaller = createAICaller(ctx);
        const result = await aiCaller.hello({
          criteria: input.criteria,
          challengeAndSolutionPrompt: input.challengeAndSolutionPrompt,
          bypassInternalToken: process.env.BYPASS_TOKEN,
        });

        return { success: true, evaluation: result };
      }

      // Handle paid challenges (must be authenticated)
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required for paid challenges",
        });
      }

      // Only check and deduct credits for paid challenges
      const userCredits = await ctx.db.query.credits.findFirst({
        where: eq(credits.userId, userId),
      });

      if (!userCredits || userCredits.balance < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits",
        });
      }

      // Deduct 1 credit for paid challenge submission
      await ctx.db
        .update(credits)
        .set({ balance: userCredits.balance - 1 })
        .where(eq(credits.userId, userId));

      // Process paid challenge submission
      const aiCaller = createAICaller(ctx);
      const result = await aiCaller.hello({
        criteria: input.criteria,
        challengeAndSolutionPrompt: input.challengeAndSolutionPrompt,
      });

      return { success: true, evaluation: result };
    }),
});
