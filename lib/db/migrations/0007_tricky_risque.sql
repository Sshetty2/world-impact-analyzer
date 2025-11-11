ALTER TABLE "pantheon_person" ALTER COLUMN "prob_ratio" SET DATA TYPE numeric(15, 6);--> statement-breakpoint
ALTER TABLE "pantheon_person" ALTER COLUMN "hpi_raw" SET DATA TYPE numeric(15, 6);--> statement-breakpoint
ALTER TABLE "pantheon_person" ALTER COLUMN "coefficient_of_variation" SET DATA TYPE numeric(15, 6);--> statement-breakpoint
ALTER TABLE "pantheon_person" ALTER COLUMN "hpi" SET DATA TYPE numeric(15, 6);--> statement-breakpoint
ALTER TABLE "pantheon_person" ADD COLUMN "birthplace_country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "pantheon_person" ADD COLUMN "birthplace_continent" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_birthplace_continent_idx" ON "pantheon_person" USING btree ("birthplace_continent");