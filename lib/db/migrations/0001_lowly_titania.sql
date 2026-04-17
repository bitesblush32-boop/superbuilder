CREATE TABLE "comms_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid,
	"student_name" varchar(255),
	"template" varchar(100) NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'sent' NOT NULL,
	"error" text,
	"triggered_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "engage_answers" jsonb;--> statement-breakpoint
ALTER TABLE "comms_log" ADD CONSTRAINT "comms_log_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comms_log_created_at_idx" ON "comms_log" USING btree ("created_at");