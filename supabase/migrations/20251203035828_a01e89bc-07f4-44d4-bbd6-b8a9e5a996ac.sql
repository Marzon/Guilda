-- Add expires_at column to subscriptions table for time-limited subscriptions (ADVENTURER)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.subscriptions.expires_at IS 'Expiration date for time-limited subscriptions like ADVENTURER (6 months). NULL means lifetime (FOUNDER).';