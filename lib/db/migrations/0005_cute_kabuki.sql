CREATE TABLE IF NOT EXISTS "historical_figure_analysis" (
	"name" text PRIMARY KEY NOT NULL,
	"analysis" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Delete existing chat data (incompatible with new schema that requires analysis)
-- This is necessary because chats now require a foreign key to historical_figure_analysis
DELETE FROM "Vote";
--> statement-breakpoint
DELETE FROM "Message";
--> statement-breakpoint
DELETE FROM "Chat";
--> statement-breakpoint
-- Drop the old columns if they exist
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "analysisResponse";
--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "analyzedPersonName";
--> statement-breakpoint
-- Add analyzedPersonName column (NOT NULL)
ALTER TABLE "Chat" ADD COLUMN "analyzedPersonName" text NOT NULL;
--> statement-breakpoint
-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_analyzedPersonName_historical_figure_analysis_name_fk" FOREIGN KEY ("analyzedPersonName") REFERENCES "public"."historical_figure_analysis"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
