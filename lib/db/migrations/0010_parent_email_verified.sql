-- Add email_verified column to parents table
ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;
