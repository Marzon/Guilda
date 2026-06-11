-- Create batch subscription info function to eliminate N+1 queries
CREATE OR REPLACE FUNCTION get_batch_subscription_info(user_ids UUID[])
RETURNS TABLE(
  user_id UUID,
  tier subscription_tier,
  is_premium BOOLEAN,
  daily_matches_remaining INTEGER,
  is_boosted BOOLEAN,
  boost_expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_subs AS (
    SELECT 
      u.id,
      COALESCE(s.tier, 'FREE'::subscription_tier) as tier,
      COALESCE(s.tier = 'FOUNDER', false) as is_premium
    FROM unnest(user_ids) u(id)
    LEFT JOIN subscriptions s ON s.user_id = u.id
  ),
  user_limits AS (
    SELECT 
      u.id,
      COALESCE(dl.matches_sent, 0) as matches_sent
    FROM unnest(user_ids) u(id)
    LEFT JOIN daily_limits dl ON dl.user_id = u.id AND dl.reset_date = CURRENT_DATE
  ),
  user_boosts AS (
    SELECT 
      u.id,
      pb.expires_at
    FROM unnest(user_ids) u(id)
    LEFT JOIN profile_boosts pb ON pb.user_id = u.id AND pb.expires_at > now()
    ORDER BY pb.expires_at DESC
  )
  SELECT
    us.id,
    us.tier,
    us.is_premium,
    CASE WHEN us.is_premium THEN 999999 ELSE GREATEST(0, 3 - ul.matches_sent) END as daily_matches_remaining,
    ub.expires_at IS NOT NULL as is_boosted,
    ub.expires_at
  FROM user_subs us
  LEFT JOIN user_limits ul ON ul.id = us.id
  LEFT JOIN user_boosts ub ON ub.id = us.id;
END;
$$;