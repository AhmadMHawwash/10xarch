import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { credits, creditTransactions } from "@/server/db/schema";
import { creditTransactionSchema } from "@/lib/validations/credits";

// Check if we're in a development environment
const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const useCreditsSchema = z.object({
  amount: z.number(),
  description: z.string(),
});

const addCreditsSchema = z.object({
  amount: z.number(),
});

const getTransactionsOutputSchema = z.object({
  transactions: z.array(creditTransactionSchema),
});

export const creditsRouter = createTRPCRouter({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    // In development mode, ctx.auth should already contain a userId
    // The protectedProcedure middleware handles this
    const userId = isDevelopmentMode ? "dev_user_123" : ctx.auth.userId;

    const userCredits = await ctx.db.query.credits.findFirst({
      where: eq(credits.userId, userId),
    });

    return { credits: userCredits };
  }),

  getTransactions: protectedProcedure
    .output(getTransactionsOutputSchema)
    .query(async ({ ctx }) => {
      const userId = isDevelopmentMode ? "dev_user_123" : ctx.auth.userId;

      const transactions = await ctx.db.query.creditTransactions.findMany({
        where: eq(creditTransactions.userId, userId),
        orderBy: [
          desc(creditTransactions.createdAt),
        ],
        limit: 50,
      });

      return { transactions };
    }),

  use: protectedProcedure
    .input(useCreditsSchema)
    .output(
      z.object({
        success: z.boolean(),
        transaction: creditTransactionSchema,
        left: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = isDevelopmentMode ? "dev_user_123" : ctx.auth.userId;

      // Check if user has enough credits
      const userCredits = await ctx.db.query.credits.findFirst({
        where: eq(credits.userId, userId),
      });

      if (!userCredits || userCredits.balance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits",
        });
      }

      // Create transaction and update balance
      const [transaction] = await ctx.db
        .insert(creditTransactions)
        .values({
          userId,
          amount: -input.amount,
          type: "usage",
          status: "completed",
          description: input.description,
        })
        .returning();

      if (!transaction) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create transaction",
        });
      }

      const left = userCredits.balance - input.amount;
      await ctx.db
        .update(credits)
        .set({ balance: left })
        .where(eq(credits.userId, userId));

      return { success: true, transaction, left };
    }),

  addCredits: protectedProcedure
    .input(addCreditsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = isDevelopmentMode ? "dev_user_123" : ctx.auth.userId;

      // Get current credits
      const userCredits = await ctx.db.query.credits.findFirst({
        where: eq(credits.userId, userId),
      });

      if (!userCredits) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User credits not found",
        });
      }

      // Create transaction and update balance
      const [transaction] = await ctx.db
        .insert(creditTransactions)
        .values({
          userId,
          amount: input.amount,
          type: "purchase",
          status: "completed",
          description: `Purchased ${input.amount} credits`,
        })
        .returning();

      if (!transaction) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create transaction",
        });
      }

      await ctx.db
        .update(credits)
        .set({
          balance: userCredits.balance + input.amount,
        })
        .where(eq(credits.userId, userId));

      return { success: true };
    }),
});
