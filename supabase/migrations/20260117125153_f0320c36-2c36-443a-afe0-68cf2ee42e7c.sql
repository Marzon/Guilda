-- Add otp_verified field to profiles to track our custom OTP verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_otp_verified ON public.profiles(otp_verified);

-- Comment
COMMENT ON COLUMN public.profiles.otp_verified IS 'Tracks if user has verified their email via OTP code';