-- Add signup data fields to social_payment_submissions for marketing signups
ALTER TABLE public.social_payment_submissions
ADD COLUMN IF NOT EXISTS signup_name TEXT,
ADD COLUMN IF NOT EXISTS signup_email TEXT,
ADD COLUMN IF NOT EXISTS signup_phone TEXT;

-- Add index for looking up by email
CREATE INDEX IF NOT EXISTS idx_social_payment_submissions_signup_email 
ON public.social_payment_submissions(signup_email);

-- Add comment explaining the new fields
COMMENT ON COLUMN public.social_payment_submissions.signup_name IS 'Name provided during marketing site signup';
COMMENT ON COLUMN public.social_payment_submissions.signup_email IS 'Email provided during marketing site signup';
COMMENT ON COLUMN public.social_payment_submissions.signup_phone IS 'Phone provided during marketing site signup';