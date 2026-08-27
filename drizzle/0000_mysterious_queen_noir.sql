CREATE TABLE "kapal" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nama" text NOT NULL,
	"tambangan_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"status" text DEFAULT 'titik_a' NOT NULL,
	"departing_from" text,
	"timer_end_at" timestamp with time zone,
	"last_departure_at" timestamp with time zone,
	"last_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kapal_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kapal_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"kapal_id" integer NOT NULL,
	"event" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tambangan" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nama" text NOT NULL,
	"titik_a_nama" text NOT NULL,
	"titik_a_lat" double precision,
	"titik_a_lng" double precision,
	"titik_b_nama" text NOT NULL,
	"titik_b_lat" double precision,
	"titik_b_lng" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tambangan_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'nahkoda' NOT NULL,
	"tambangan_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "kapal" ADD CONSTRAINT "kapal_tambangan_id_tambangan_id_fk" FOREIGN KEY ("tambangan_id") REFERENCES "public"."tambangan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kapal" ADD CONSTRAINT "kapal_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kapal_events" ADD CONSTRAINT "kapal_events_kapal_id_kapal_id_fk" FOREIGN KEY ("kapal_id") REFERENCES "public"."kapal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tambangan_id_tambangan_id_fk" FOREIGN KEY ("tambangan_id") REFERENCES "public"."tambangan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kapal_tambangan_idx" ON "kapal" USING btree ("tambangan_id");--> statement-breakpoint
CREATE INDEX "kapal_owner_idx" ON "kapal" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "kapal_lastUpdated_status_idx" ON "kapal" USING btree ("last_updated_at","status");--> statement-breakpoint
CREATE INDEX "kapal_events_kapal_idx" ON "kapal_events" USING btree ("kapal_id");