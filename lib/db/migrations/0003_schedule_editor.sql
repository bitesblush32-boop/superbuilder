CREATE TABLE "programme_config" (
	"section" varchar(50) PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"url" text,
	"target_stage" varchar(20),
	"target_section" varchar(50),
	"scheduled_at" timestamp with time zone,
	"duration_mins" integer,
	"is_visible" boolean DEFAULT true NOT NULL,
	"notify_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
