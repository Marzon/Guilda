-- Update get_subscription_info function to handle ADVENTURER tier
CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
 RETURNS TABLE(tier subscription_tier, is_premium boolean, daily_matches_remaining integer, is_boosted boolean, boost_expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier subscription_tier;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_matches_sent INTEGER;
  v_boost_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get subscription info including expires_at
  SELECT s.tier, s.expires_at INTO v_tier, v_expires_at 
  FROM subscriptions s WHERE s.user_id = p_user_id;
  
  -- If no subscription or tier is null, create FREE subscription
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  -- Check if ADVENTURER subscription has expired
  IF v_tier = 'ADVENTURER' AND v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    -- Downgrade to FREE if expired
    UPDATE subscriptions SET tier = 'FREE', expires_at = NULL WHERE user_id = p_user_id;
    v_tier := 'FREE';
  END IF;
  
  -- Get daily matches sent
  SELECT dl.matches_sent INTO v_matches_sent 
  FROM daily_limits dl 
  WHERE dl.user_id = p_user_id AND dl.reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;
  
  -- Get active boost
  SELECT pb.expires_at INTO v_boost_expires
  FROM profile_boosts pb
  WHERE pb.user_id = p_user_id AND pb.expires_at > now()
  ORDER BY pb.expires_at DESC
  LIMIT 1;
  
  -- Return info with tier-specific limits:
  -- FREE: 1 match/day
  -- ADVENTURER: 10 matches/day
  -- FOUNDER: unlimited (999999)
  RETURN QUERY SELECT
    v_tier,
    v_tier IN ('FOUNDER', 'ADVENTURER'),
    CASE 
      WHEN v_tier = 'FOUNDER' THEN 999999
      WHEN v_tier = 'ADVENTURER' THEN GREATEST(0, 10 - v_matches_sent)
      ELSE GREATEST(0, 1 - v_matches_sent) -- FREE tier: 1 match/day
    END,
    v_boost_expires IS NOT NULL,
    v_boost_expires;
END;
$function$;