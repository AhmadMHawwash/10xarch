ALTER TABLE "sdp_users" DROP CONSTRAINT "sdp_users_email_unique";--> statement-breakpoint
ALTER TABLE "sdp_users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "sdp_users" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "sdp_users" ADD COLUMN "subscription_status" text;--> statement-breakpoint
ALTER TABLE "sdp_users" ADD COLUMN "subscription_tier" text;--> statement-breakpoint
ALTER TABLE "sdp_users" ADD COLUMN "subscription_period_end" timestamp;