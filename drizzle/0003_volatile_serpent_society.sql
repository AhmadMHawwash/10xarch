ALTER TABLE "system-design-playground_playgrounds" RENAME TO "sdp_playgrounds";--> statement-breakpoint
ALTER TABLE "system-design-playground_post" RENAME TO "sdp_post";--> statement-breakpoint
ALTER TABLE "system-design-playground_users" RENAME TO "sdp_users";--> statement-breakpoint
ALTER TABLE "system-design-playground_waitlist" RENAME TO "sdp_waitlist";--> statement-breakpoint
ALTER TABLE "sdp_users" DROP CONSTRAINT "system-design-playground_users_email_unique";--> statement-breakpoint
ALTER TABLE "sdp_playgrounds" DROP CONSTRAINT "system-design-playground_playgrounds_owner_id_system-design-playground_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sdp_playgrounds" ADD CONSTRAINT "sdp_playgrounds_owner_id_sdp_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "sdp_users" ADD CONSTRAINT "sdp_users_email_unique" UNIQUE("email");