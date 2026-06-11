-- Update get_match_contact_info to show contacts for ANY interaction (not just accepted matches)
-- Premium users can see contact info for any user they have interacted with (pending/accepted match or conversation)

CREATE OR REPLACE FUNCTION public.get_match_contact_info(other_user_id_param uuid)
RETURNS TABLE(email text, phone text, linkedin_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  is_premium boolean;
  has_interaction boolean;
BEGIN
  caller_id := auth.uid();
  
  IF caller_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if caller has active premium subscription or is admin
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE user_id = caller_id 
    AND tier IN ('ADVENTURER', 'FOUNDER', 'ALPHA')
    AND (expires_at IS NULL OR expires_at > NOW())
  ) OR EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = caller_id 
    AND role = 'admin'
  ) INTO is_premium;
  
  IF NOT is_premium THEN
    RETURN;
  END IF;
  
  -- Check for ANY interaction (match or conversation) - no status requirement
  SELECT EXISTS(
    -- Any match (pending, accepted, rejected, any status)
    SELECT 1 FROM matches 
    WHERE (requester_id = caller_id AND target_id = other_user_id_param)
       OR (requester_id = other_user_id_param AND target_id = caller_id)
  ) OR EXISTS(
    -- Any conversation
    SELECT 1 FROM conversations 
    WHERE (participant_1 = caller_id AND participant_2 = other_user_id_param)
       OR (participant_1 = other_user_id_param AND participant_2 = caller_id)
  ) INTO has_interaction;
  
  IF NOT has_interaction THEN
    RETURN;
  END IF;
  
  -- Return contact info
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