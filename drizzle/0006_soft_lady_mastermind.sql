-- First, update any existing playgrounds with empty owner_id
-- We'll set them to a special value that signifies they're system-owned
UPDATE "sdp_playgrounds"
SET 
  "owner_id" = (SELECT "id" FROM "sdp_users" LIMIT 1),
  "created_by" = (SELECT "id" FROM "sdp_users" LIMIT 1),
  "updated_by" = (SELECT "id" FROM "sdp_users" LIMIT 1)
WHERE "owner_id" = '' OR "owner_id" IS NULL OR "created_by" = '' OR "created_by" IS NULL OR "updated_by" = '' OR "updated_by" IS NULL;
--> statement-breakpoint

-- Now add the foreign key constraints
DO $$ BEGIN
 ALTER TABLE "sdp_playgrounds" ADD CONSTRAINT "sdp_playgrounds_owner_id_sdp_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sdp_playgrounds" ADD CONSTRAINT "sdp_playgrounds_created_by_sdp_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sdp_playgrounds" ADD CONSTRAINT "sdp_playgrounds_updated_by_sdp_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."sdp_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
