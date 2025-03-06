-- Add institution fields to PlaidAccount table
ALTER TABLE "PlaidAccount" ADD COLUMN "institutionId" TEXT;
ALTER TABLE "PlaidAccount" ADD COLUMN "institutionName" TEXT;
ALTER TABLE "PlaidAccount" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
