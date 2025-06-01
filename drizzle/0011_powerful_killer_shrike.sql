ALTER TABLE "sdp_subscriptions" RENAME COLUMN "user_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "sdp_subscriptions" DROP CONSTRAINT "sdp_subscriptions_user_id_sdp_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sdp_subscriptions" ADD COLUMN "owner_type" text NOT NULL;