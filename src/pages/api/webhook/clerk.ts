import { type NextApiRequest, type NextApiResponse } from "next";
import { Webhook } from "svix";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { credits, creditTransactions, users } from "@/server/db/schema";

const FREE_SIGNUP_CREDITS = 50;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received Clerk webhook (pages router)");
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Webhook secret not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  // Get the headers
  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;

  console.log("svix_id", svix_id);
  console.log("svix_timestamp", svix_timestamp);
  console.log("svix_signature", svix_signature);
  
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing webhook headers");
    return res.status(400).json({ error: "Missing webhook headers" });
  }

  // Get the body
  const payload = req.body as Record<string, unknown>;
  const body = JSON.stringify(payload);

  console.log("body", body);
  
  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).json({ error: "Error verifying webhook" });
  }

  // Handle the webhook
  switch (evt.type) {
    case "user.created":
    case "user.updated":
      if (evt.data.email_addresses?.[0]) {
        await db
          .insert(users)
          .values({
            id: evt.data.id,
            email: evt.data.email_addresses[0].email_address,
          })
          .onConflictDoUpdate({
            target: users.id,
            set: { email: evt.data.email_addresses[0].email_address },
          });

        await db.insert(credits).values({
          userId: evt.data.id,
          balance: FREE_SIGNUP_CREDITS,
        });

        await db.insert(creditTransactions).values({
          userId: evt.data.id,
          amount: FREE_SIGNUP_CREDITS,
          type: "purchase",
          description: "Free signup credit",
          status: "completed",
        });
      }
      break;
    case "user.deleted":
      await db.delete(users).where(eq(users.id, evt.data.id!));
      break;
    default:
      console.log("Unhandled webhook event type:", evt.type);
  }

  return res.status(200).json({ message: "Webhook processed successfully" });
} 