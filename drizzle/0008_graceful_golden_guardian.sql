DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE "public"."subscription_status" AS ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');
    END IF;
END
$$;
--> statement-breakpoint
CREATE TABLE "sdp_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_subscription_id" text,
	"status" "subscription_status" NOT NULL,
	"tier" text NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" integer DEFAULT 0 NOT NULL,
	"canceled_at" timestamp,
	"ended_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sdp_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "sdp_subscriptions" ADD CONSTRAINT "sdp_subscriptions_user_id_sdp_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdp_users" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "sdp_users" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "sdp_users" DROP COLUMN "subscription_tier";--> statement-breakpoint
ALTER TABLE "sdp_users" DROP COLUMN "subscription_period_end";