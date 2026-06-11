-- Fix search_path for security
CREATE OR REPLACE FUNCTION check_daily_limit(p_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier subscription_tier;
  v_matches_sent INTEGER;
BEGIN
  SELECT tier INTO v_tier FROM subscriptions WHERE user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  IF v_tier = 'FOUNDER' THEN
    RETURN TRUE;
  END IF;
  
  SELECT matches_sent INTO v_matches_sent 
  FROM daily_limits 
  WHERE user_id = p_user_id AND reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    INSERT INTO daily_limits (user_id, matches_sent, reset_date)
    VALUES (p_user_id, 0, CURRENT_DATE);
    RETURN TRUE;
  END IF;
  
  RETURN v_matches_sent < 3;
END;
$$;

CREATE OR REPLACE FUNCTION increment_daily_matches(p_user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO daily_limits (user_id, matches_sent, reset_date)
  VALUES (p_user_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id, reset_date) 
  DO UPDATE SET matches_sent = daily_limits.matches_sent + 1;
END;
$$;

CREATE OR REPLACE FUNCTION get_subscription_info(p_user_id UUID)
RETURNS TABLE (
  tier subscription_tier,
  is_premium BOOLEAN,
  daily_matches_remaining INTEGER,
  is_boosted BOOLEAN,
  boost_expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier subscription_tier;
  v_matches_sent INTEGER;
  v_boost_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT s.tier INTO v_tier FROM subscriptions s WHERE s.user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  SELECT dl.matches_sent INTO v_matches_sent 
  FROM daily_limits dl 
  WHERE dl.user_id = p_user_id AND dl.reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;
  
  SELECT pb.expires_at INTO v_boost_expires
  FROM profile_boosts pb
  WHERE pb.user_id = p_user_id AND pb.expires_at > now()
  ORDER BY pb.expires_at DESC
  LIMIT 1;
  
  RETURN QUERY SELECT
    v_tier,
    v_tier = 'FOUNDER',
    CASE WHEN v_tier = 'FOUNDER' THEN 999999 ELSE GREATEST(0, 3 - v_matches_sent) END,
    v_boost_expires IS NOT NULL,
    v_boost_expires;
END;
$$;