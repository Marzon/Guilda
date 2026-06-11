-- Drop the existing check constraint
ALTER TABLE pix_config DROP CONSTRAINT IF EXISTS pix_config_product_type_check;

-- Re-create with adventurer_pass included
ALTER TABLE pix_config ADD CONSTRAINT pix_config_product_type_check 
CHECK (product_type = ANY (ARRAY['founder_pass'::text, 'tavern_board'::text, 'adventurer_pass'::text]));

-- Insert PIX config for adventurer_pass
INSERT INTO pix_config (product_type, pix_key, expected_amount, qr_code_url)
VALUES ('adventurer_pass', 'https://nubank.com.br/cobrar/f4b5/692fa169-e060-41e7-94d8-0a21c8916baa', 29.99, '/qr-codes/adventurer_pass.png')
ON CONFLICT (product_type) DO UPDATE SET 
  pix_key = EXCLUDED.pix_key,
  expected_amount = EXCLUDED.expected_amount,
  qr_code_url = EXCLUDED.qr_code_url;

-- Update get_subscription_info function to handle ADVENTURER tier and new limits
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

-- Update get_batch_subscription_info for batch queries
CREATE OR REPLACE FUNCTION public.get_batch_subscription_info(user_ids uuid[])
 RETURNS TABLE(user_id uuid, tier subscription_tier, is_premium boolean, daily_matches_remaining integer, is_boosted boolean, boost_expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_subs AS (
    SELECT 
      u.id,
      COALESCE(s.tier, 'FREE'::subscription_tier) as tier,
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
  ),
  user_boosts AS (
    SELECT DISTINCT ON (u.id)
      u.id,
      pb.expires_at
    FROM unnest(user_ids) u(id)
    LEFT JOIN profile_boosts pb ON pb.user_id = u.id AND pb.expires_at > now()
    ORDER BY u.id, pb.expires_at DESC
  )
  SELECT
    us.id,
    us.effective_tier,
    us.effective_tier IN ('FOUNDER', 'ADVENTURER'),
    CASE 
      WHEN us.effective_tier = 'FOUNDER' THEN 999999 
      WHEN us.effective_tier = 'ADVENTURER' THEN GREATEST(0, 10 - ul.matches_sent)
      ELSE GREATEST(0, 1 - ul.matches_sent)
    END as daily_matches_remaining,
    ub.expires_at IS NOT NULL as is_boosted,
    ub.expires_at
  FROM user_subs us
  LEFT JOIN user_limits ul ON ul.id = us.id
  LEFT JOIN user_boosts ub ON ub.id = us.id;
END;
$function$;