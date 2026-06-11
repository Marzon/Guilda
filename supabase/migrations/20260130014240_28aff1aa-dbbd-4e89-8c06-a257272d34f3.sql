-- Update function to allow premium users to see ALL contacts (not just accepted matches)
-- Free users still cannot see any contacts
CREATE OR REPLACE FUNCTION public.get_premium_contact_matches()
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  is_premium boolean;
BEGIN
  caller_id := auth.uid();
  
  IF caller_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if caller has active premium subscription (or is admin)
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE subscriptions.user_id = caller_id 
    AND tier IN ('ADVENTURER', 'FOUNDER', 'ALPHA')
    AND (expires_at IS NULL OR expires_at > NOW())
  ) OR EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = caller_id 
    AND role = 'admin'
  ) INTO is_premium;
  
  IF NOT is_premium THEN
    RETURN;
  END IF;
  
  -- For premium users: return ALL user IDs they have any interaction with
  -- This includes: pending matches, accepted matches, conversations
  RETURN QUERY
  SELECT DISTINCT all_users.user_id FROM (
    -- All matches (accepted, pending, any status)
    SELECT CASE 
      WHEN requester_id = caller_id THEN target_id
      ELSE requester_id
    END as user_id
    FROM matches 
    WHERE requester_id = caller_id OR target_id = caller_id
    
    UNION
    
    -- All conversations
    SELECT CASE 
      WHEN participant_1 = caller_id THEN participant_2
      ELSE participant_1
    END as user_id
    FROM conversations 
    WHERE participant_1 = caller_id OR participant_2 = caller_id
  ) all_users;
END;
$$;