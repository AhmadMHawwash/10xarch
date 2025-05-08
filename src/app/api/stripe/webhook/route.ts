import { db } from "@/server/db";
import { creditTransactions, credits, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { buffer } from "node:stream/consumers";
import Stripe from "stripe";

// Check if we're in a development environment
const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

// Only initialize Stripe in production mode
const stripe = !isDevelopmentMode && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
    })
  : null;

export async function POST(req: Request) {
  try {
    console.log(" Webhook received");

    // For development mode, always return success
    if (isDevelopmentMode) {
      console.log(" [DEV MODE] Skipping webhook processing in development mode");
      return new Response(JSON.stringify({ 
        received: true, 
        dev_mode: true,
        message: "Stripe webhooks are not processed in development mode" 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // For production, we need Stripe configured
    if (!stripe) {
      console.error(" Stripe is not initialized");
      return new Response(JSON.stringify({ 
        error: "Stripe is not initialized",
        message: "This endpoint is only available in production mode with valid Stripe credentials"
      }), {
        status: 501, // Not Implemented
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error(" Missing STRIPE_WEBHOOK_SECRET");
      return new Response(JSON.stringify({
        error: "Missing STRIPE_WEBHOOK_SECRET",
        message: "Webhook secret is required for processing Stripe webhooks"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const body = await buffer(req.body!);
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.log(" Missing stripe-signature header");
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(" Event verified:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(" Processing completed checkout session");
      
      // Get userId from session metadata
      const userId = session.metadata?.userId;
      if (!userId) {
        console.error(" Missing userId in session metadata");
        throw new Error("Missing userId in session metadata");
      }

      // Get tokens from metadata
      const totalTokens = parseInt(session.metadata?.totalTokens ?? "0");
      const baseTokens = parseInt(session.metadata?.baseTokens ?? "0");
      const bonusTokens = parseInt(session.metadata?.bonusTokens ?? "0");
      
      console.log(` Processing purchase: ${baseTokens} base tokens + ${bonusTokens} bonus tokens = ${totalTokens} total tokens for user ${userId}`);

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        console.error(` User ${userId} not found`);
        throw new Error("User not found");
      }

      console.log(` Found user ${user.email}`);

      // Add credits to user's account
      await db.transaction(async (tx) => {
        console.log(" Starting transaction");
        // Record the transaction
        const txResult = await tx.insert(creditTransactions).values({
          userId,
          amount: totalTokens,
          type: "purchase",
          description: `Purchased ${baseTokens.toLocaleString()} tokens + ${bonusTokens.toLocaleString()} bonus tokens`,
          status: "completed",
          stripeSessionId: session.id,
        });
        console.log(" Transaction recorded:", txResult);

        // Get current credits
        const userCredits = await tx.query.credits.findFirst({
          where: eq(credits.userId, userId),
        });

        // Should never happen, because users have free credits on signup
        if (!userCredits) {
          // Create initial credits record if it doesn't exist
          await tx.insert(credits).values({
            userId,
            balance: totalTokens,
          });
          console.log(` Created new credits record with ${totalTokens} tokens`);
        } else {
          // Update existing credit balance
          const updateResult = await tx
            .update(credits)
            .set({
              balance: userCredits.balance + totalTokens,
            })
            .where(eq(credits.userId, userId));
          console.log(` Updated credits from ${userCredits.balance} to ${userCredits.balance + totalTokens}`);
        }
      });

      console.log(` Successfully processed ${totalTokens} tokens for user ${userId}`);
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
