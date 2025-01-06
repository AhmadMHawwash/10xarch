import { db } from "@/server/db";
import { creditTransactions, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { buffer } from "node:stream/consumers";
import Stripe from "stripe";

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
  try {
    console.log(" Webhook received");
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
      process.env.STRIPE_WEBHOOK_SECRET!
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
        });
        console.log(" Transaction recorded:", txResult);

        // Get current credits
        const currentCredits = await tx
          .select({ value: users.credits })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .then((result) => result[0]?.value ?? 0);
        
        console.log(` Current credits: ${currentCredits}`);

        // Update user's credit balance
        const updateResult = await tx
          .update(users)
          .set({
            credits: currentCredits + totalTokens,
          })
          .where(eq(users.id, userId));
        
        console.log(" Credits updated:", updateResult);
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
