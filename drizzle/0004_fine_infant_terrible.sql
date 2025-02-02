ALTER TABLE "sdp_chat_message_counts" RENAME COLUMN "session_id" TO "identifier";--> statement-breakpoint
DROP INDEX IF EXISTS "session_challenge_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "identifier_challenge_idx" ON "sdp_chat_message_counts" USING btree ("identifier","challenge_id");