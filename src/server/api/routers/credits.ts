import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { credits, creditTransactions } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { creditTransactionSchema } from "@/lib/validations/credits";

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
    const { userId } = await auth();
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const userCredits = await ctx.db.query.credits.findFirst({
      where: eq(credits.userId, userId),
    });

    return { credits: userCredits };
  }),

  getTransactions: protectedProcedure
    .output(getTransactionsOutputSchema)
    .query(async ({ ctx }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const transactions = await ctx.db.query.creditTransactions.findMany({
        where: eq(creditTransactions.userId, userId),
        orderBy: (creditTransactions, { desc }) => [
          desc(creditTransactions.createdAt),
        ],
        limit: 50,
      });

      return { transactions };
    }),

  use: protectedProcedure
    .input(useCreditsSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

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

      await ctx.db
        .update(credits)
        .set({ balance: userCredits.balance - input.amount })
        .where(eq(credits.userId, userId));

      return { success: true, transaction };
    }),

  addCredits: protectedProcedure
    .input(addCreditsSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

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
        .set({ balance: userCredits.balance + input.amount })
        .where(eq(credits.userId, userId));

      return { success: true, transaction };
    }),
});
