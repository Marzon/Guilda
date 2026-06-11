-- Add email tracking column to waitlist_signups
ALTER TABLE public.waitlist_signups 
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_email_opened 
ON public.waitlist_signups(email_opened_at) 
WHERE email_opened_at IS NOT NULL;