DO $$ BEGIN
 CREATE TYPE "public"."owner_type" AS ENUM('user', 'org');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" DROP CONSTRAINT IF EXISTS "sdp_playgrounds_owner_id_sdp_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "json_blob" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "owner_type" "owner_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "updated_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "editor_ids" text[];--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "viewer_ids" text[];--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "current_visitor_ids" text[];--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "last_evaluation_at" timestamp;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "evaluation_score" integer;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "evaluation_feedback" text;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "is_public" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" DROP COLUMN IF EXISTS "content";