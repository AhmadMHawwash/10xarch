import { calculatePurchaseTokens, isValidAmount } from "@/lib/tokens";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { creditTransactions, users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { amount } = input;

      if (!isValidAmount(amount)) {
        throw new Error("Invalid amount");
      }

      const { userId } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      const { totalTokens, baseTokens, bonusTokens } =
        calculatePurchaseTokens(amount);

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Credits Purchase",
                  description: `${baseTokens.toLocaleString()} tokens + ${bonusTokens.toLocaleString()} bonus tokens`,
                },
                unit_amount: Math.round(amount * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
          customer_email: user.email,
          metadata: {
            userId: user.id,
            totalTokens: totalTokens.toString(),
            baseTokens: baseTokens.toString(),
            bonusTokens: bonusTokens.toString(),
          },
        });

        return { id: session.id, url: session.url };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  verifySession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      const { userId } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      if (session.metadata?.userId !== user.id) {
        throw new Error("Invalid user");
      }

      // Check if we've already processed this session
      const existingTransaction = await ctx.db.query.creditTransactions.findFirst({
        where: eq(creditTransactions.stripeSessionId, session.id),
      });

      if (existingTransaction) {
        return {
          success: true,
          totalTokens: parseInt(session.metadata?.totalTokens ?? "0"),
        };
      }

      const totalTokens = parseInt(session.metadata?.totalTokens ?? "0");
      const baseTokens = parseInt(session.metadata?.baseTokens ?? "0");
      const bonusTokens = parseInt(session.metadata?.bonusTokens ?? "0");

      // Add credits to user's account
      await ctx.db.transaction(async (tx) => {
        // Record the transaction
        await tx.insert(creditTransactions).values({
          userId,
          amount: totalTokens,
          type: "purchase",
          description: `Purchased ${baseTokens.toLocaleString()} tokens + ${bonusTokens.toLocaleString()} bonus tokens`,
          status: "completed",
          stripeSessionId: session.id, // Add this to prevent double-processing
        });

        // Get current credits
        const currentCredits = await tx
          .select({ value: users.credits })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .then((result) => result[0]?.value ?? 0);

        // Update user's credit balance
        await tx
          .update(users)
          .set({
            credits: currentCredits + totalTokens,
          })
          .where(eq(users.id, userId));
      });

      return {
        success: true,
        totalTokens,
      };
    }),
});
