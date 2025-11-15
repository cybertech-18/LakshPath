-- Add summary, source, and jobMeta columns to JDComparison for auto-scout comparisons
ALTER TABLE "JDComparison" ADD COLUMN "summary" TEXT;
ALTER TABLE "JDComparison" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "JDComparison" ADD COLUMN "jobMeta" TEXT;
