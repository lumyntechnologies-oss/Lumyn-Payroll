-- Drop old password column and add clerkId
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;

-- Backfill existing users with a placeholder clerkId so the unique constraint works
UPDATE "users" SET "clerkId" = 'legacy_' || id WHERE "clerkId" IS NULL;

-- Make clerkId NOT NULL and unique
ALTER TABLE "users" ALTER COLUMN "clerkId" SET NOT NULL;

-- Add unique constraint if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_clerkId_key'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_clerkId_key" UNIQUE ("clerkId");
  END IF;
END $$;

-- Update default role from HR_ADMIN to EMPLOYEE (already enum, just update default)
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
