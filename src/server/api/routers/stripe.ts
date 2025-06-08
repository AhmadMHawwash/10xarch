import Stripe from "stripe";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { subscriptions, tokenBalances, tokenLedger, users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { 
  calculatePurchaseTokens, 
  isValidAmount, 
  SUBSCRIPTION_TIERS,
  CREDIT_PACKAGES,
  type SubscriptionTier
} from "@/lib/tokens";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.union([
        z.object({
          amount: z.number().min(1),
        }),
        z.object({
          packageName: z.enum(["small", "medium", "large", "extra_large"]),
        }),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      // Handle both amount and packageName inputs
      let amount: number;
      let packageName: keyof typeof CREDIT_PACKAGES | undefined;
      
      if ("amount" in input) {
        amount = input.amount;
      } else {
        packageName = input.packageName;
        const package_ = CREDIT_PACKAGES[packageName];
        amount = package_.price;
      }

      if (!isValidAmount(amount)) {
        throw new Error("Invalid amount");
      }

      const { userId, orgId, orgSlug } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      // For organizations, check if they have an active subscription before allowing topup
      if (orgId) {
        const activeSubscription = await ctx.db.query.subscriptions.findFirst({
          where: and(
            eq(subscriptions.ownerType, "org"),
            eq(subscriptions.ownerId, orgId),
            eq(subscriptions.status, "active")
          ),
        });

        if (!activeSubscription) {
          throw new Error("Organizations must have an active subscription before purchasing credits. Please subscribe first.");
        }
      }

      // Calculate tokens based on package or amount
      let totalTokens: number, baseTokens: number, bonusTokens: number;
      
      if (packageName) {
        const package_ = CREDIT_PACKAGES[packageName];
        totalTokens = package_.totalTokens;
        baseTokens = package_.tokens;
        bonusTokens = package_.bonusTokens;
      } else {
        const result = calculatePurchaseTokens(amount);
        totalTokens = result.totalTokens;
        baseTokens = result.baseTokens;
        bonusTokens = result.bonusTokens;
      }

      // Determine if this is an organization or personal purchase
      const ownerType = orgId ? "org" : "user";
      const ownerId = orgId ?? userId;

      try {
        const productName = packageName 
          ? `${CREDIT_PACKAGES[packageName].name}${orgId ? ` - ${orgSlug} (Organization)` : " (Personal)"}`
          : `Tokens Purchase${orgId ? ` ${orgSlug} (Organization)` : " (Personal)"}`;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: productName,
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
            orgId: orgId ?? "",
            ownerType,
            ownerId,
            totalTokens: totalTokens.toString(),
            baseTokens: baseTokens.toString(),
            bonusTokens: bonusTokens.toString(),
            ...(packageName && { tokenPackage: packageName }),
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

      const { userId, orgId } = await auth();

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

      // Get owner context from session metadata and current auth
      const sessionOwnerType = session.metadata?.ownerType ?? "user";
      const sessionOwnerId = session.metadata?.ownerId ?? userId;
      
      // Verify current context matches the session context
      const currentOwnerType = orgId ? "org" : "user";
      const currentOwnerId = orgId ?? userId;
      
      if (sessionOwnerType !== currentOwnerType || sessionOwnerId !== currentOwnerId) {
        throw new Error("Session context does not match current user context");
      }

      // Check if we've already processed this session by looking for ledger entry
      const existingLedgerEntry = await ctx.db.query.tokenLedger.findFirst({
        where: and(
          eq(tokenLedger.ownerType, sessionOwnerType),
          eq(tokenLedger.ownerId, sessionOwnerId),
          eq(tokenLedger.reason, 'topup')
        ),
      });

      if (existingLedgerEntry) {
        return {
          success: true,
          totalTokens: parseInt(session.metadata?.totalTokens ?? "0"),
          message: "Session already processed",
        };
      }

      const totalTokens = parseInt(session.metadata?.totalTokens ?? "0");
      const baseTokens = parseInt(session.metadata?.baseTokens ?? "0");
      const bonusTokens = parseInt(session.metadata?.bonusTokens ?? "0");

      // Add tokens to owner's account
      await ctx.db.transaction(async (tx) => {
        // Upsert token_balances for owner (nonexpiring tokens)
        const existingBalance = await tx.query.tokenBalances.findFirst({
          where: and(
            eq(tokenBalances.ownerType, sessionOwnerType),
            eq(tokenBalances.ownerId, sessionOwnerId)
          ),
        });

        if (!existingBalance) {
          await tx.insert(tokenBalances).values({
            ownerType: sessionOwnerType,
            ownerId: sessionOwnerId,
            expiringTokens: 0,
            expiringTokensExpiry: null,
            nonexpiringTokens: totalTokens,
            updatedAt: new Date(),
          });
        } else {
          // Update existing token balance
          await tx
            .update(tokenBalances)
            .set({
              nonexpiringTokens: existingBalance.nonexpiringTokens + totalTokens,
              updatedAt: new Date(),
            })
            .where(and(
              eq(tokenBalances.ownerType, sessionOwnerType),
              eq(tokenBalances.ownerId, sessionOwnerId)
            ));
        }

        // Record the transaction in token_ledger with unique session identifier
        await tx.insert(tokenLedger).values({
          ownerType: sessionOwnerType,
          ownerId: sessionOwnerId,
          type: "nonexpiring",
          amount: totalTokens,
          reason: 'topup',
          expiry: null,
          createdAt: new Date(),
        });
      });

      return {
        success: true,
        totalTokens,
        message: `Successfully added ${totalTokens} tokens (${baseTokens} base + ${bonusTokens} bonus)`,
      };
    }),

  getCurrentSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      const { userId, orgId } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Determine current context (org or personal)
      const ownerType = orgId ? "org" : "user";
      const ownerId = orgId ?? userId;

      console.log("Getting subscription for:", { userId, orgId, ownerType, ownerId });

      const subscription = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.ownerType, ownerType),
          eq(subscriptions.ownerId, ownerId),
          eq(subscriptions.status, "active")
        ),
        orderBy: (subscriptions, { desc }) => [desc(subscriptions.created_at)],
      });

      console.log("Found active subscription:", subscription ? {
        id: subscription.id,
        status: subscription.status,
        tier: subscription.tier,
        stripe_subscription_id: subscription.stripe_subscription_id
      } : "No active subscription found");

      return subscription;
    }),

  createSubscriptionSession: protectedProcedure
    .input(z.object({
      tier: z.enum(["pro", "premium"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tier } = input;

      const { userId, orgId, orgRole } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // If creating subscription for an organization, verify admin role
      if (orgId && orgRole !== "org:admin") {
        throw new Error("Only organization admins can manage subscriptions");
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Determine current context (org or personal)
      const ownerType = orgId ? "org" : "user";
      const ownerId = orgId ?? userId;

      const subscriptionTier = SUBSCRIPTION_TIERS[tier];
      if (!subscriptionTier) {
        throw new Error("Invalid subscription tier");
      }

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: subscriptionTier.priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
          customer_email: user.email,
          // Add payment method collection to handle authentication
          payment_method_collection: "if_required",
          // Add automatic tax if applicable
          automatic_tax: { enabled: false },
          // Allow promotion codes
          allow_promotion_codes: true,
          metadata: {
            userId: user.id,
            orgId: orgId ?? "",
            ownerType,
            ownerId,
            tier,
          },
          subscription_data: {
            metadata: {
              userId: user.id,
              orgId: orgId ?? "",
              ownerType,
              ownerId,
              tier,
            },
            // Add trial period if needed (uncomment if you want trials)
            // trial_period_days: 7,
          },
        });

        return { id: session.id, url: session.url };
      } catch (error) {
        console.error("Error creating subscription session:", error);
        throw new Error("Failed to create subscription session");
      }
    }),

  createCustomerPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { userId, orgId, orgRole } = await auth();

      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // If managing subscription for an organization, verify admin role
      if (orgId && orgRole !== "org:admin") {
        throw new Error("Only organization admins can manage subscriptions");
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Determine current context (org or personal)
      const ownerType = orgId ? "org" : "user";
      const ownerId = orgId ?? userId;

      try {
        // Find the customer's existing subscription for the current context
        const subscriptions = await stripe.subscriptions.list({
          limit: 100,
        });

        // Find subscription for current context (active or incomplete)
        const contextSubscription = subscriptions.data.find(sub => 
          sub.metadata?.userId === userId &&
          sub.metadata?.ownerType === ownerType &&
          sub.metadata?.ownerId === ownerId &&
          (sub.status === 'active' || sub.status === 'incomplete' || sub.status === 'past_due')
        );

        if (!contextSubscription) {
          throw new Error("No subscription found for current context. Please create a subscription first.");
        }

        // Enhanced return URL with context about the action
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/credits?portal=completed`;

        const session = await stripe.billingPortal.sessions.create({
          customer: contextSubscription.customer as string,
          return_url: returnUrl,
        });

        console.log(`✅ Created Customer Portal session for ${ownerType} ${ownerId} with subscription ${contextSubscription.id} (status: ${contextSubscription.status})`);

        return { url: session.url };
      } catch (error) {
        console.error("Error creating customer portal session:", error);
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Failed to create customer portal session");
      }
    }),
});
