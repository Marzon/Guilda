-- Create table to track invalid emails
CREATE TABLE IF NOT EXISTS public.invalid_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  notified_user boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.invalid_emails ENABLE ROW LEVEL SECURITY;

-- Admin can read/write
CREATE POLICY "Admins can manage invalid emails"
ON public.invalid_emails
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to validate email format
CREATE OR REPLACE FUNCTION public.is_valid_email(email_address text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  domain text;
  tld text;
BEGIN
  -- Basic format check
  IF email_address !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN false;
  END IF;
  
  -- Extract domain
  domain := substring(email_address from '@(.+)$');
  
  -- Extract TLD
  tld := substring(domain from '\.([^.]+)$');
  
  -- TLD must be at least 2 characters
  IF length(tld) < 2 THEN
    RETURN false;
  END IF;
  
  -- Check for common typos in popular domains
  IF domain ~ '\.(co|cm|con|cmo|om|comm|coom|gmai|gmal|gmial|gmil|hotmai|hotmal|yahooo|outloo)$' THEN
    RETURN false;
  END IF;
  
  -- Check for common domain typos
  IF domain ~ '^(gmal|gmial|gmil|gmaill|gnail|htomail|hotmal|hotmial|yaho|yahooo|outllok|outlok)\.' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to scan and mark invalid emails
CREATE OR REPLACE FUNCTION public.scan_invalid_emails()
RETURNS TABLE(email text, user_id uuid, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert newly detected invalid emails
  INSERT INTO public.invalid_emails (email, user_id, reason)
  SELECT 
    au.email,
    au.id,
    CASE
      WHEN au.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN 'Invalid format'
      WHEN length(substring(substring(au.email from '@(.+)$') from '\.([^.]+)$')) < 2 THEN 'TLD too short (e.g., .c instead of .com)'
      WHEN substring(au.email from '@(.+)$') ~ '\.(co|cm|con|cmo|om|comm|coom)$' THEN 'Possible typo in TLD'
      WHEN substring(au.email from '@(.+)$') ~ '^(gmal|gmial|gmil|gnail|htomail|hotmal|yaho|outlok)\.' THEN 'Possible typo in domain'
      ELSE 'Unknown validation error'
    END
  FROM auth.users au
  WHERE NOT public.is_valid_email(au.email)
  ON CONFLICT (email) DO NOTHING;
  
  -- Return all invalid emails
  RETURN QUERY
  SELECT ie.email, ie.user_id, ie.reason
  FROM public.invalid_emails ie;
END;
$$;

-- Update claim_broadcast_emails to skip invalid emails
CREATE OR REPLACE FUNCTION public.claim_broadcast_emails(
  p_batch_size integer DEFAULT 10,
  p_max_attempts integer DEFAULT 3
)
RETURNS SETOF public.broadcast_email_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First, mark emails from invalid_emails table as failed
  UPDATE public.broadcast_email_queue beq
  SET 
    status = 'failed',
    error_message = 'Invalid email address: ' || ie.reason
  FROM public.invalid_emails ie
  WHERE beq.email = ie.email
  AND beq.status IN ('pending', 'processing');
  
  -- Now claim valid emails
  RETURN QUERY
  UPDATE public.broadcast_email_queue
  SET 
    status = 'processing',
    last_attempt_at = now()
  WHERE id IN (
    SELECT beq.id FROM public.broadcast_email_queue beq
    WHERE 
      -- Normal pending emails not in invalid list
      (beq.status = 'pending' AND beq.attempts < p_max_attempts)
      OR
      -- Emails stuck in processing for more than 5 minutes (zombie recovery)
      (beq.status = 'processing' AND beq.last_attempt_at < now() - interval '5 minutes')
    AND NOT EXISTS (
      SELECT 1 FROM public.invalid_emails ie WHERE ie.email = beq.email
    )
    ORDER BY 
      CASE WHEN beq.status = 'pending' THEN 0 ELSE 1 END,
      beq.created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;