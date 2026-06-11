-- Drop and recreate get_batch_subscription_info with correct premium tiers
DROP FUNCTION IF EXISTS public.get_batch_subscription_info(uuid[]);

CREATE FUNCTION public.get_batch_subscription_info(user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  tier subscription_tier,
  is_premium boolean,
  daily_matches_remaining integer,
  is_boosted boolean,
  boost_expires_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_subs AS (
    SELECT 
      u.id,
      COALESCE(s.tier, 'FREE'::subscription_tier) as sub_tier,
      s.expires_at,
      CASE 
        WHEN s.tier = 'ADVENTURER' AND s.expires_at IS NOT NULL AND s.expires_at < now() THEN 'FREE'::subscription_tier
        ELSE COALESCE(s.tier, 'FREE'::subscription_tier)
      END as effective_tier
    FROM unnest(user_ids) u(id)
    LEFT JOIN subscriptions s ON s.user_id = u.id
  ),
  user_limits AS (
    SELECT 
      u.id,
      COALESCE(dl.matches_sent, 0) as matches_sent
    FROM unnest(user_ids) u(id)
    LEFT JOIN daily_limits dl ON dl.user_id = u.id AND dl.reset_date = CURRENT_DATE
  )
  SELECT
    us.id,
    us.effective_tier,
    us.effective_tier IN ('FOUNDER', 'ALPHA'),
    CASE 
      WHEN us.effective_tier = 'FOUNDER' THEN 999999 
      WHEN us.effective_tier = 'ADVENTURER' THEN GREATEST(0, 10 - ul.matches_sent)
      ELSE GREATEST(0, 1 - ul.matches_sent)
    END,
    false,
    NULL::timestamp with time zone
  FROM user_subs us
  LEFT JOIN user_limits ul ON ul.id = us.id;
END;
$$;