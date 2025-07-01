CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'analyzing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "sdp_repository_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playground_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"repository_url" text NOT NULL,
	"repository_full_name" text NOT NULL,
	"branch" text DEFAULT 'main',
	"is_private" integer DEFAULT 0 NOT NULL,
	"privacy_mode" integer DEFAULT 0 NOT NULL,
	"status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"current_expert" text,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"estimated_tokens" integer,
	"actual_tokens_used" integer,
	"detected_languages" text[],
	"detected_frameworks" text[],
	"architecture_type" text,
	"identified_components" jsonb,
	"expert_analyses" jsonb,
	"analysis_log" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sdp_user_github_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"encrypted_token" text NOT NULL,
	"token_type" text DEFAULT 'personal_access_token' NOT NULL,
	"scopes" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"is_active" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sdp_repository_analyses" ADD CONSTRAINT "sdp_repository_analyses_playground_id_sdp_playgrounds_id_fk" FOREIGN KEY ("playground_id") REFERENCES "public"."sdp_playgrounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdp_repository_analyses" ADD CONSTRAINT "sdp_repository_analyses_user_id_sdp_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdp_user_github_tokens" ADD CONSTRAINT "sdp_user_github_tokens_user_id_sdp_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;