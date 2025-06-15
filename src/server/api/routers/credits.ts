import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { tokenBalances, tokenLedger } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { creditTransactionSchema } from "@/lib/validations/credits";
import { deductTokensFromAccount } from "@/lib/tokens-server";

export const creditsRouter = createTRPCRouter({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const { userId, orgId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Determine current context (org or personal)
    const ownerType = orgId ? "org" : "user";
    const ownerId = orgId ?? userId;

    const balance = await ctx.db.query.tokenBalances.findFirst({
      where: and(
        eq(tokenBalances.ownerType, ownerType),
        eq(tokenBalances.ownerId, ownerId),
      ),
    });

    // Return a default balance object if no record is found
    const defaultBalance = {
      id: null,
      ownerType,
      ownerId,
      expiringTokens: 0,
      expiringTokensExpiry: null,
      nonexpiringTokens: 0,
      updatedAt: new Date(),
    };

    return {
      balance: balance ?? defaultBalance,
    };
  }),

  getTransactions: protectedProcedure
    .output(
      z.object({
        transactions: z.array(creditTransactionSchema),
      }),
    )
    .query(async ({ ctx }) => {
      const { userId, orgId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Determine current context (org or personal) - same logic as getBalance
      const ownerType = orgId ? "org" : "user";
      const ownerId = orgId ?? userId;

      const transactions = await ctx.db.query.tokenLedger.findMany({
        where: and(
          eq(tokenLedger.ownerType, ownerType),
          eq(tokenLedger.ownerId, ownerId)
        ),
        orderBy: (tokenLedger, { desc }) => [desc(tokenLedger.createdAt)],
        limit: 50,
      });
      return { transactions };
    }),

  use: protectedProcedure
    .input(z.object({ amount: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const { userId, orgId } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Use the shared token deduction utility
      const result = await deductTokensFromAccount({
        userId,
        orgId,
        tokensUsed: input.amount,
        reason: "usage",
      });

      return {
        success: true,
        transaction: {
          expiringTokens: result.finalExpiringBalance,
          nonexpiringTokens: result.finalNonexpiringBalance,
          tokensDeducted: result.tokensDeducted,
        },
      };
    }),
});
