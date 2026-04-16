CREATE TYPE "public"."domain" AS ENUM('health', 'education', 'finance', 'environment', 'entertainment', 'social_impact', 'other');--> statement-breakpoint
CREATE TYPE "public"."grade" AS ENUM('8', '9', '10', '11', '12');--> statement-breakpoint
CREATE TYPE "public"."pipeline_stage" AS ENUM('1', '2', '3', '4', '5');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'captured', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('pro', 'premium');--> statement-breakpoint
CREATE TABLE "idea_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"problem_statement" text NOT NULL,
	"target_user" text NOT NULL,
	"ai_approach" text NOT NULL,
	"domain" "domain" NOT NULL,
	"tech_stack_pref" varchar(100),
	"prior_build_exp" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"relationship" varchar(50),
	"consent_given" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp,
	"safety_acknowledged" boolean DEFAULT false NOT NULL,
	"emergency_contact" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"razorpay_order_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"amount" integer NOT NULL,
	"tier" "tier" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"is_emi" boolean DEFAULT false,
	"emi_phase" integer DEFAULT 1,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"team_id" uuid,
	"title" varchar(255) NOT NULL,
	"problem_statement" text NOT NULL,
	"solution_desc" text NOT NULL,
	"ai_tools" text[],
	"tech_stack" text,
	"domain" "domain" NOT NULL,
	"demo_video_url" text,
	"github_url" text,
	"screenshot_urls" text[],
	"biggest_challenge" text,
	"next_steps" text,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"passed" boolean NOT NULL,
	"attempt_num" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referee_id" uuid NOT NULL,
	"paid" boolean DEFAULT false,
	"voucher_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"judge_id" uuid NOT NULL,
	"innovation" integer,
	"impact" integer,
	"technical" integer,
	"presentation" integer,
	"completeness" integer,
	"total_score" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"grade" "grade" NOT NULL,
	"school_name" text,
	"city" varchar(100),
	"state" varchar(100),
	"gender" varchar(20),
	"date_of_birth" timestamp,
	"current_stage" "pipeline_stage" DEFAULT '1' NOT NULL,
	"tier" "tier",
	"is_paid" boolean DEFAULT false NOT NULL,
	"xp_points" integer DEFAULT 0 NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"referral_code" varchar(20),
	"referred_by" varchar(20),
	"coding_exp" varchar(50),
	"interests" text[],
	"team_preference" varchar(20),
	"availability_hrs" varchar(20),
	"device_access" varchar(20),
	"tshirt_size" varchar(5),
	"instagram_handle" varchar(100),
	"linkedin_handle" varchar(100),
	"discord_id" varchar(100),
	"certificate_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "students_email_unique" UNIQUE("email"),
	CONSTRAINT "students_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "workshop_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"workshop_num" integer NOT NULL,
	"attended" boolean DEFAULT false,
	"watched_replay" boolean DEFAULT false,
	"xp_awarded" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "idea_submissions" ADD CONSTRAINT "idea_submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_students_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_students_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_attendance" ADD CONSTRAINT "workshop_attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "students_city_idx" ON "students" USING btree ("city");--> statement-breakpoint
CREATE INDEX "students_stage_idx" ON "students" USING btree ("current_stage");