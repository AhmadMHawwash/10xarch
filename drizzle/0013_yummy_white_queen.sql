CREATE TYPE "public"."backup_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TABLE "sdp_backup_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playground_id" uuid NOT NULL,
	"commit_sha" text NOT NULL,
	"commit_url" text NOT NULL,
	"commit_message" text NOT NULL,
	"status" "backup_status" NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "last_backup_commit_sha" text;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "backup_status" "backup_status";--> statement-breakpoint
ALTER TABLE "sdp_backup_history" ADD CONSTRAINT "sdp_backup_history_playground_id_sdp_playgrounds_id_fk" FOREIGN KEY ("playground_id") REFERENCES "public"."sdp_playgrounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdp_backup_history" ADD CONSTRAINT "sdp_backup_history_created_by_sdp_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;