-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS public.get_subscription_info(uuid);

-- Create updated get_subscription_info function with project limits
CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
 RETURNS TABLE(
   tier subscription_tier, 
   is_premium boolean, 
   daily_matches_remaining integer, 
   is_boosted boolean, 
   boost_expires_at timestamp with time zone, 
   monthly_messages_remaining integer,
   projects_count integer,
   max_projects integer,
   can_create_project boolean
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier subscription_tier;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_matches_sent INTEGER;
  v_messages_sent INTEGER;
  v_projects_count INTEGER;
BEGIN
  SELECT s.tier, s.expires_at INTO v_tier, v_expires_at 
  FROM subscriptions s WHERE s.user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  IF v_tier = 'ADVENTURER' AND v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    UPDATE subscriptions SET tier = 'FREE', expires_at = NULL WHERE user_id = p_user_id;
    v_tier := 'FREE';
  END IF;
  
  SELECT dl.matches_sent INTO v_matches_sent 
  FROM daily_limits dl 
  WHERE dl.user_id = p_user_id AND dl.reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;
  
  SELECT mml.messages_sent INTO v_messages_sent 
  FROM monthly_message_limits mml 
  WHERE mml.user_id = p_user_id 
    AND mml.reset_month = date_trunc('month', CURRENT_DATE)::date;
  
  IF v_messages_sent IS NULL THEN
    v_messages_sent := 0;
  END IF;
  
  -- Count user's projects (excluding showcase projects)
  SELECT COUNT(*)::integer INTO v_projects_count 
  FROM projects 
  WHERE owner_id = p_user_id AND (is_showcase = false OR is_showcase IS NULL);
  
  RETURN QUERY SELECT
    v_tier,
    v_tier IN ('FOUNDER', 'ADVENTURER'),
    CASE 
      WHEN v_tier = 'FOUNDER' THEN 999999
      WHEN v_tier = 'ADVENTURER' THEN GREATEST(0, 10 - v_matches_sent)
      ELSE GREATEST(0, 1 - v_matches_sent)
    END,
    false,
    NULL::timestamp with time zone,
    CASE 
      WHEN v_tier IN ('FOUNDER', 'ADVENTURER') THEN 999999
      ELSE GREATEST(0, 100 - v_messages_sent)
    END,
    v_projects_count,
    CASE 
      WHEN v_tier = 'FOUNDER' THEN 999999
      WHEN v_tier = 'ADVENTURER' THEN 2
      ELSE 1
    END,
    CASE 
      WHEN v_tier = 'FOUNDER' THEN true
      WHEN v_tier = 'ADVENTURER' THEN v_projects_count < 2
      ELSE v_projects_count < 1
    END;
END;
$function$;