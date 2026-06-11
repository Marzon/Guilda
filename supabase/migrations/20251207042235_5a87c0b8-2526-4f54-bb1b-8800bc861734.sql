-- Create rate limiting function for email_leads
CREATE OR REPLACE FUNCTION public.check_email_leads_rate_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count submissions from this email in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM email_leads
  WHERE LOWER(email) = LOWER(p_email)
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 5 submissions per email per hour
  RETURN recent_count < 5;
END;
$$;

-- Drop existing permissive insert policy
DROP POLICY IF EXISTS "Anyone can submit email leads" ON public.email_leads;

-- Create new insert policy with rate limiting
CREATE POLICY "Rate limited email leads insert" 
ON public.email_leads 
FOR INSERT 
WITH CHECK (check_email_leads_rate_limit(email));