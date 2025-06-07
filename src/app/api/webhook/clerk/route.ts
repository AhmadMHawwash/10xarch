import { db } from "@/server/db";
import { tokenBalances, tokenLedger, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

const FREE_SIGNUP_CREDITS = 50;

type EventType = "user.created" | "user.updated" | "user.deleted" | "*";

interface UserEvent {
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    created_at: number;
    updated_at: number;
  };
  object: "event";
  type: EventType;
}

export async function POST(req: NextRequest) {
  console.log("Received Clerk webhook");
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Webhook secret not configured");
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

  console.log("svix_id", svix_id);
  console.log("svix_timestamp", svix_timestamp);
  console.log("svix_signature", svix_signature);
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing webhook headers");
    return NextResponse.json(
      { error: "Missing webhook headers" },
      { status: 400 },
    );
  }

  // Get the body
  const bodyText = await req.text();
  const body = Buffer.from(bodyText);

  console.log("body", body);
  
  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: UserEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as UserEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 },
    );
  }

  const { id, email_addresses } = evt.data;
  const email = email_addresses[0]?.email_address;

  console.log(`Received ${evt.type} event for user ${id} (${email})`);

  if (evt.type === "user.created") {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (existingUser) {
        console.log(`User ${id} already exists, skipping creation`);
        return NextResponse.json({ success: true });
      }

      await db.transaction(async (tx) => {
        // Create user record
        await tx.insert(users).values({
          id,
          email: email!,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Grant free signup tokens (non-expiring)
        await tx.insert(tokenBalances).values({
          ownerType: "user",
          ownerId: id,
          expiringTokens: 0,
          expiringTokensExpiry: null,
          nonexpiringTokens: FREE_SIGNUP_CREDITS,
          updatedAt: new Date(),
        });

        // Record the free tokens transaction
        await tx.insert(tokenLedger).values({
          ownerType: "user",
          ownerId: id,
          type: "nonexpiring",
          amount: FREE_SIGNUP_CREDITS,
          reason: "signup",
          expiry: null,
          createdAt: new Date(),
        });
      });

      console.log(`Created user ${id} with ${FREE_SIGNUP_CREDITS} free tokens`);
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }

  if (evt.type === "user.updated") {
    try {
      // Update user record
      await db
        .update(users)
        .set({
          email: email!,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      console.log(`Updated user ${id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }

  if (evt.type === "user.deleted") {
    try {
      await db.transaction(async (tx) => {
        // Delete token ledger entries first (foreign key constraint)
        await tx.delete(tokenLedger).where(eq(tokenLedger.ownerId, id));
        
        // Delete token balances
        await tx.delete(tokenBalances).where(eq(tokenBalances.ownerId, id));
        
        // Delete user record
        await tx.delete(users).where(eq(users.id, id));
      });

      console.log(`Deleted user ${id} and cleaned up all associated data`);
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
