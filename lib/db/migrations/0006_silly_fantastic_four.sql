CREATE TABLE IF NOT EXISTS "pantheon_person" (
	"id" integer PRIMARY KEY NOT NULL,
	"wd_id" text,
	"wp_id" integer,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"occupation" text NOT NULL,
	"domain" text,
	"era" text,
	"prob_ratio" numeric(15, 6),
	"gender" varchar(1),
	"twitter" text,
	"alive" boolean DEFAULT false NOT NULL,
	"l" integer,
	"hpi_raw" numeric(15, 6),
	"birthplace_name" text,
	"birthplace_lat" numeric(10, 7),
	"birthplace_lon" numeric(10, 7),
	"birthplace_geonameid" integer,
	"birthplace_country" text,
	"birthplace_country_code" varchar(2),
	"birthplace_continent" text,
	"birthdate" text,
	"birthyear" integer,
	"deathplace_name" text,
	"deathplace_lat" numeric(10, 7),
	"deathplace_lon" numeric(10, 7),
	"deathplace_geonameid" integer,
	"deathplace_country" text,
	"deathdate" text,
	"deathyear" integer,
	"birthplace_geacron_name" text,
	"deathplace_geacron_name" text,
	"is_group" boolean DEFAULT false,
	"l_" integer,
	"age" integer,
	"non_en_page_views" integer,
	"coefficient_of_variation" numeric(15, 6),
	"hpi" numeric(15, 6)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_name_idx" ON "pantheon_person" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_hpi_idx" ON "pantheon_person" USING btree ("hpi");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_domain_idx" ON "pantheon_person" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_era_idx" ON "pantheon_person" USING btree ("era");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_occupation_idx" ON "pantheon_person" USING btree ("occupation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_birthplace_country_idx" ON "pantheon_person" USING btree ("birthplace_country");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_birthplace_continent_idx" ON "pantheon_person" USING btree ("birthplace_continent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_birthyear_idx" ON "pantheon_person" USING btree ("birthyear");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantheon_alive_idx" ON "pantheon_person" USING btree ("alive");