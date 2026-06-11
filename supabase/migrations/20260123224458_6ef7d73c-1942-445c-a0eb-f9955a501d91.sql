-- Drop and recreate the function with fixed column names
DROP FUNCTION IF EXISTS public.scan_invalid_emails();

CREATE FUNCTION public.scan_invalid_emails()
RETURNS TABLE(found_email text, found_user_id uuid, found_reason text)
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