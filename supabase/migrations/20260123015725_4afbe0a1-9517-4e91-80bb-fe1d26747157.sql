-- Add linkedin_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN linkedin_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.linkedin_url IS 'LinkedIn profile URL for premium contact display';