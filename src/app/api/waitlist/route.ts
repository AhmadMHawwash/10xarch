import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { waitlistTable } from "@/server/db/schema";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email: string };

  try {
    await db.insert(waitlistTable).values({ email });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inserting into waitlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join waitlist" },
      { status: 500 },
    );
  }
}
