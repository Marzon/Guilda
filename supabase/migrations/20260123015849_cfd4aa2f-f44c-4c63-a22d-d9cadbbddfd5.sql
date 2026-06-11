-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_match_contact_info(uuid);

-- Recreate the function with linkedin_url included
CREATE OR REPLACE FUNCTION public.get_match_contact_info(other_user_id_param uuid)
RETURNS TABLE(email text, phone text, linkedin_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  is_premium boolean;
  has_accepted_match boolean;
BEGIN
  caller_id := auth.uid();
  
  IF caller_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if caller has active premium subscription
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE user_id = caller_id 
    AND tier IN ('ADVENTURER', 'FOUNDER', 'ALPHA')
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO is_premium;
  
  IF NOT is_premium THEN
    RETURN;
  END IF;
  
  -- Check if there's an accepted match between users
  SELECT EXISTS(
    SELECT 1 FROM matches 
    WHERE status = 'ACCEPTED'
    AND (
      (requester_id = caller_id AND target_id = other_user_id_param)
      OR (requester_id = other_user_id_param AND target_id = caller_id)
    )
  ) INTO has_accepted_match;
  
  IF NOT has_accepted_match THEN
    RETURN;
  END IF;
  
  -- Return contact info including linkedin_url
  RETURN QUERY
  SELECT 
    au.email::text,
    p.phone::text,
    p.linkedin_url::text
  FROM auth.users au
  JOIN profiles p ON p.id = au.id
  WHERE au.id = other_user_id_param;
END;
$$;