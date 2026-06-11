-- Add locale column to waitlist_signups table for i18n email support
ALTER TABLE waitlist_signups 
ADD COLUMN locale TEXT DEFAULT 'pt';

-- Add comment for documentation
COMMENT ON COLUMN waitlist_signups.locale IS 'User preferred language: pt, en, or es';