-- Function to get all user IDs whose contacts can be viewed by the premium caller
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
  
  -- Check if caller has active premium subscription
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE subscriptions.user_id = caller_id 
    AND tier IN ('ADVENTURER', 'FOUNDER', 'ALPHA')
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO is_premium;
  
  IF NOT is_premium THEN
    RETURN;
  END IF;
  
  -- Return all user_ids with accepted match
  RETURN QUERY
  SELECT DISTINCT 
    CASE 
      WHEN requester_id = caller_id THEN target_id
      ELSE requester_id
    END as user_id
  FROM matches 
  WHERE status = 'ACCEPTED'
  AND (requester_id = caller_id OR target_id = caller_id);
END;
$$;