import { type NextRequest, NextResponse } from "next/server";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { credits, creditTransactions, users } from "@/server/db/schema";

const FREE_SIGNUP_CREDITS = 50;

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing webhook headers" },
      { status: 400 },
    );
  }

  // Get the body
  const payload = (await req.json()) as unknown;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    } as WebhookRequiredHeaders) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 },
    );
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

  return NextResponse.json({ message: "Webhook processed successfully" });
}
