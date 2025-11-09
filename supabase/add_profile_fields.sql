-- Add new fields to Profile table for user information and goals
ALTER TABLE public."Profile"
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "creditHistoryAge" TEXT,
ADD COLUMN IF NOT EXISTS "creditScore" INTEGER,
ADD COLUMN IF NOT EXISTS "knowsCreditScore" BOOLEAN,
ADD COLUMN IF NOT EXISTS "travelGoal" TEXT,
ADD COLUMN IF NOT EXISTS "diningGoal" TEXT,
ADD COLUMN IF NOT EXISTS "buildCreditGoal" TEXT,
ADD COLUMN IF NOT EXISTS "cashbackGoal" TEXT,
ADD COLUMN IF NOT EXISTS "onlineShoppingGoal" TEXT;
