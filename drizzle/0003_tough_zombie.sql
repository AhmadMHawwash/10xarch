CREATE TABLE IF NOT EXISTS "sdp_chat_message_counts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"challenge_id" text NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_reset_time" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_challenge_idx" ON "sdp_chat_message_counts" USING btree ("session_id","challenge_id");