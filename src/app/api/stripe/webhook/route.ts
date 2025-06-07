import { db } from "@/server/db";
import { subscriptions, tokenLedger } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { 
  SUBSCRIPTION_TIERS, 
  CREDIT_PACKAGES
} from "@/lib/tokens";
import { addTokensToAccount, handleTierChangeTokens } from "@/lib/tokens-server";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !body) {
    return new Response("Missing signature or body", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout session completed:", {
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        // Handle subscription checkout completion differently from one-time payments
        if (session.mode === "subscription") {
          console.log("Subscription checkout completed - waiting for customer.subscription.created event");
          // Don't create subscription record here - wait for customer.subscription.created
          break;
        }

        // Handle one-time token purchases (existing logic)
        if (session.mode === "payment" && session.payment_status === "paid") {
          const tokenPackage = session.metadata?.tokenPackage;
          if (!tokenPackage) {
            console.error("No tokenPackage in session metadata");
            break;
          }

          const package_ = CREDIT_PACKAGES[tokenPackage as keyof typeof CREDIT_PACKAGES];
          if (!package_) {
            console.error("Invalid token package:", tokenPackage);
            break;
          }

          // Add tokens to user's account
          const totalTokens = await addTokensToAccount({
            userId: session.metadata!.userId!,
            orgId: session.metadata?.orgId ?? null,
            baseTokens: package_.tokens,
            bonusTokens: package_.bonusTokens ?? 0,
          });

          console.log(`Added ${totalTokens} tokens for user ${session.metadata!.userId}`);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object;
        console.log("Subscription created:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
          metadata: subscription.metadata,
        });

        // Handle all subscription statuses, including incomplete
        if (subscription.status === "incomplete") {
          console.log("⚠️ Subscription created with incomplete status - payment authentication may be required");
        }

        // Find the subscription tier based on price ID
        const priceId = subscription.items.data[0]?.price.id;
        const subscriptionTier = Object.entries(SUBSCRIPTION_TIERS).find(
          ([, tier]) => tier.priceId === priceId
        );

        if (!subscriptionTier) {
          console.error("Unknown subscription price ID:", priceId);
          break;
        }

        const [tierKey] = subscriptionTier;

        // Get user info from subscription metadata (set during checkout)
        const userId = subscription.metadata?.userId;
        const orgId = subscription.metadata?.orgId ?? null;
        const ownerType = subscription.metadata?.ownerType ?? (orgId ? "org" : "user");
        const ownerId = subscription.metadata?.ownerId ?? (orgId ?? userId);

        if (!userId) {
          console.error("No userId in subscription metadata:", subscription.metadata);
          break;
        }

        if (!ownerId) {
          console.error("No ownerId determined:", { userId, orgId, ownerType });
          break;
        }

        console.log("Creating subscription with data:", {
          userId,
          ownerType,
          ownerId,
          tier: tierKey,
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        try {
          // Create subscription record in database - include incomplete status
          await db.insert(subscriptions).values({
            userId,
            ownerType,
            ownerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status as any,
            tier: tierKey as "pro" | "premium",
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end ? 1 : 0,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            created_at: new Date(),
          });

          console.log(`✅ Successfully created subscription record: ${subscription.id} for ${ownerType} ${ownerId} with status: ${subscription.status}`);
          
          // Don't add tokens for incomplete subscriptions - wait for payment success
          if (subscription.status === "incomplete") {
            console.log("⏳ Tokens will be added when payment is completed");
          }
        } catch (dbError) {
          console.error("❌ Database error creating subscription:", dbError);
          console.error("Subscription data:", {
            userId,
            ownerType,
            ownerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            tier: tierKey,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("🔄 Subscription updated webhook received:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          metadata: subscription.metadata,
        });

        try {
          // First, check if subscription exists in database
          const existingSubscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.stripe_subscription_id, subscription.id),
          });

          if (!existingSubscription) {
            console.error("❌ Subscription not found in database for update:", subscription.id);
            break;
          }

          console.log("📋 Existing subscription in database:", {
            id: existingSubscription.id,
            currentStatus: existingSubscription.status,
            currentTier: existingSubscription.tier,
            newStatus: subscription.status,
            ownerType: existingSubscription.ownerType,
            ownerId: existingSubscription.ownerId,
          });

          // Check if tier changed by comparing price IDs
          const newPriceId = subscription.items.data[0]?.price.id;
          const newTierEntry = Object.entries(SUBSCRIPTION_TIERS).find(
            ([, tier]) => tier.priceId === newPriceId
          );

          if (!newTierEntry) {
            console.error("❌ Unknown subscription price ID:", newPriceId);
            break;
          }

          const [newTierKey] = newTierEntry;
          const oldTierKey = existingSubscription.tier;
          const tierChanged = newTierKey !== oldTierKey;

          // Handle tier change with token adjustments
          if (tierChanged) {
            console.log(`🔄 Tier change detected: ${oldTierKey} → ${newTierKey}`);
            
            const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
            const { newTokenBalance, isUpgrade, consumedTokens } = await handleTierChangeTokens({
              ownerType: existingSubscription.ownerType,
              ownerId: existingSubscription.ownerId,
              oldTier: oldTierKey,
              newTier: newTierKey,
              subscriptionEndDate,
            });

            if (isUpgrade) {
              console.log(`✨ Tier upgraded from ${oldTierKey} to ${newTierKey}: ${consumedTokens} tokens consumed, new balance: ${newTokenBalance}`);
            } else {
              console.log(`📉 Tier downgraded from ${oldTierKey} to ${newTierKey}: ${consumedTokens} tokens consumed, new balance: ${newTokenBalance}`);
            }
          }

          // Check if cancellation status changed
          const wasCanceledAtPeriodEnd = Boolean(existingSubscription.cancel_at_period_end);
          const nowCanceledAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
          const cancellationStatusChanged = wasCanceledAtPeriodEnd !== nowCanceledAtPeriodEnd;

          if (cancellationStatusChanged) {
            if (nowCanceledAtPeriodEnd) {
              console.log(`🚫 Subscription ${subscription.id} scheduled for cancellation at period end`);
              
              // Log cancellation in ledger for audit
              await db.insert(tokenLedger).values({
                ownerType: existingSubscription.ownerType,
                ownerId: existingSubscription.ownerId,
                type: "expiring",
                amount: 0,
                reason: "subscription_scheduled_for_cancellation",
                expiry: new Date(subscription.current_period_end * 1000),
                createdAt: new Date(),
              });

              console.log(`📝 Logged cancellation scheduling for audit: ${existingSubscription.ownerType} ${existingSubscription.ownerId}`);
            } else {
              console.log(`🔄 Subscription ${subscription.id} cancellation was reversed - subscription will continue`);
              
              // Log cancellation reversal in ledger for audit
              await db.insert(tokenLedger).values({
                ownerType: existingSubscription.ownerType,
                ownerId: existingSubscription.ownerId,
                type: "expiring",
                amount: 0,
                reason: "subscription_cancellation_reversed",
                expiry: new Date(subscription.current_period_end * 1000),
                createdAt: new Date(),
              });

              console.log(`📝 Logged cancellation reversal for audit: ${existingSubscription.ownerType} ${existingSubscription.ownerId}`);
            }
          }

          // Determine final status - handle cancellation properly
          let finalStatus = subscription.status;
          if (subscription.status === "canceled" || 
              (subscription.cancel_at_period_end && subscription.status === "active")) {
            // Keep as "active" if cancel_at_period_end is true but not yet canceled
            // Only set to "canceled" if Stripe says it's actually canceled
            finalStatus = subscription.status;
          }

          // Update subscription record in database
          const updateResult = await db
            .update(subscriptions)
            .set({
              status: finalStatus as any,
              tier: newTierKey as "pro" | "premium",
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000),
              cancel_at_period_end: subscription.cancel_at_period_end ? 1 : 0,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
              updated_at: new Date(),
            })
            .where(eq(subscriptions.stripe_subscription_id, subscription.id))
            .returning();

          console.log(`✅ Updated subscription record: ${subscription.id}`);
          console.log("📊 Update result:", {
            id: updateResult[0]?.id,
            status: updateResult[0]?.status,
            tier: updateResult[0]?.tier,
            tierChanged,
            cancelAtPeriodEnd: updateResult[0]?.cancel_at_period_end,
            canceledAt: updateResult[0]?.canceled_at,
          });

          // Verify the update worked
          const verifySubscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.stripe_subscription_id, subscription.id),
          });

          console.log("🔍 Verified updated subscription:", {
            id: verifySubscription?.id,
            status: verifySubscription?.status,
            tier: verifySubscription?.tier,
            updatedAt: verifySubscription?.updated_at,
          });

        } catch (error) {
          console.error("❌ Error updating subscription:", error);
          console.error("Subscription update data:", {
            subscriptionId: subscription.id,
            status: subscription.status,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("Subscription deleted:", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        // Get existing subscription to get owner info for audit logging
        const existingSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripe_subscription_id, subscription.id),
        });

        if (existingSubscription) {
          // Log subscription deletion in ledger for audit
          await db.insert(tokenLedger).values({
            ownerType: existingSubscription.ownerType,
            ownerId: existingSubscription.ownerId,
            type: "expiring",
            amount: 0,
            reason: "subscription_deleted",
            expiry: new Date(),
            createdAt: new Date(),
          });

          console.log(`📝 Logged subscription deletion for audit: ${existingSubscription.ownerType} ${existingSubscription.ownerId}`);
        }

        // Update subscription record as canceled
        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            canceled_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(subscriptions.stripe_subscription_id, subscription.id));

        console.log(`✅ Marked subscription as deleted: ${subscription.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("Invoice payment succeeded:", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          billingReason: invoice.billing_reason,
        });

        // Only process subscription invoices
        if (!invoice.subscription) {
          console.log("Skipping non-subscription invoice");
          break;
        }

        // Skip invoices that are for subscription changes (upgrades/downgrades)
        // These are handled by customer.subscription.updated with proper consumption logic
        if (invoice.billing_reason === "subscription_update" || 
            invoice.billing_reason === "subscription_cycle" && invoice.lines?.data?.some(line => line.proration)) {
          console.log(`🔄 Skipping tier change invoice (billing_reason: ${invoice.billing_reason}) - tokens already handled by subscription.updated`);
          break;
        }

        // Get the subscription from Stripe to get the current status
        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        
        // Get subscription from database
        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripe_subscription_id, invoice.subscription as string),
        });

        if (!subscription) {
          console.error("Subscription not found in database:", invoice.subscription);
          break;
        }

        // Update subscription status if it changed from incomplete to active
        const wasIncomplete = subscription.status === "incomplete";
        const nowActive = stripeSubscription.status === "active";

        if (wasIncomplete && nowActive) {
          console.log(`🎉 Subscription ${invoice.subscription as string} changed from incomplete to active!`);
          
          // Update subscription status
          await db
            .update(subscriptions)
            .set({
              status: "active",
              updated_at: new Date(),
            })
            .where(eq(subscriptions.stripe_subscription_id, invoice.subscription as string));
        }

        // Get subscription tier info
        const tierInfo = SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS];
        const monthlyTokens = tierInfo.monthlyTokens;

        // Add tokens for successful payment (subscription tokens)
        const totalTokens = await addTokensToAccount({
          userId: subscription.userId,
          orgId: subscription.ownerType === "org" ? subscription.ownerId : null,
          baseTokens: monthlyTokens,
          bonusTokens: 0,
          isSubscription: true,
        });

        console.log(`✅ Added ${totalTokens} tokens for subscription ${subscription.stripe_subscription_id} (${wasIncomplete ? 'activation' : 'renewal'})`);
        break;
      }

      // Handle failed subscription payments
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(" Processing failed subscription payment");

        if (!invoice.subscription) {
          console.log(" No subscription ID in invoice, skipping");
          return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = stripeSubscription.metadata?.userId;
        const ownerType = stripeSubscription.metadata?.ownerType ?? "user";
        const ownerId = stripeSubscription.metadata?.ownerId ?? userId;

        if (!userId || !ownerId) {
          console.error(" Missing userId or ownerId in subscription metadata");
          throw new Error("Missing userId or ownerId in subscription metadata");
        }

        console.log(` Subscription payment failed for ${ownerType} ${ownerId}, subscription status: ${stripeSubscription.status}`);

        // Update subscription status in database
        await db.transaction(async (tx) => {
          await tx
            .update(subscriptions)
            .set({
              status: stripeSubscription.status as any,
              updated_at: new Date(),
            })
            .where(eq(subscriptions.stripe_subscription_id, stripeSubscription.id));
        });

        // Note: Don't immediately expire tokens on first payment failure
        // Stripe typically retries failed payments and the subscription
        // will only be canceled after multiple failed attempts
        console.log(` Updated subscription status to ${stripeSubscription.status} for ${ownerType} ${ownerId}`);
        break;
      }

      // Handle incomplete subscriptions requiring payment action
      case "invoice.payment_action_required": {
        const invoice = event.data.object;
        console.log("🔐 Payment action required:", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          status: invoice.status,
          paymentIntentStatus: typeof invoice.payment_intent === 'object' ? invoice.payment_intent?.status : 'string_reference',
        });

        if (invoice.subscription) {
          // Update subscription status to reflect payment action required
          await db
            .update(subscriptions)
            .set({
              status: "incomplete",
              updated_at: new Date(),
            })
            .where(eq(subscriptions.stripe_subscription_id, invoice.subscription as string));

          console.log(`🔐 Updated subscription ${invoice.subscription as string} to incomplete - payment action required`);
        }
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(" Webhook error:", err);
    return new Response(
      JSON.stringify({
        error: {
          message: err instanceof Error ? err.message : "Webhook handler failed",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
