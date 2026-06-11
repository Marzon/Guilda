-- Fix get_subscription_info to properly handle new users without monthly_message_limits records
CREATE OR REPLACE FUNCTION get_subscription_info(p_user_id uuid)
RETURNS TABLE (
  tier text,
  is_premium boolean,
  daily_matches_remaining integer,
  monthly_messages_remaining integer,
  projects_count integer,
  max_projects integer,
  can_create_project boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text := 'FREE';
  v_is_premium boolean := false;
  v_daily_limit integer := 1;
  v_monthly_msg_limit integer := 30;
  v_max_projects integer := 1;
  v_matches_sent integer := 0;
  v_messages_sent integer := 0;
  v_projects_count integer := 0;
  v_today date := current_date;
  v_current_month date := date_trunc('month', current_date)::date;
BEGIN
  -- Get active subscription tier
  SELECT s.tier INTO v_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.member_status IN ('ACTIVE', 'ENROLLED')
    AND (s.expires_at IS NULL OR s.expires_at > now())
  ORDER BY 
    CASE s.tier 
      WHEN 'ALPHA' THEN 1 
      WHEN 'FOUNDER' THEN 2 
      WHEN 'ADVENTURER' THEN 3 
      WHEN 'BASIC' THEN 4
      ELSE 5 
    END
  LIMIT 1;

  v_tier := COALESCE(v_tier, 'FREE');

  -- Set limits based on tier
  CASE v_tier
    WHEN 'ALPHA' THEN
      v_is_premium := true;
      v_daily_limit := 999999;
      v_monthly_msg_limit := 999999;
      v_max_projects := 999999;
    WHEN 'FOUNDER' THEN
      v_is_premium := true;
      v_daily_limit := 999999;
      v_monthly_msg_limit := 999999;
      v_max_projects := 10;
    WHEN 'ADVENTURER' THEN
      v_is_premium := false;
      v_daily_limit := 5;
      v_monthly_msg_limit := 100;
      v_max_projects := 3;
    WHEN 'BASIC' THEN
      v_is_premium := false;
      v_daily_limit := 3;
      v_monthly_msg_limit := 50;
      v_max_projects := 2;
    ELSE -- FREE tier
      v_is_premium := false;
      v_daily_limit := 1;
      v_monthly_msg_limit := 30;
      v_max_projects := 1;
  END CASE;

  -- Get daily matches sent (default 0 if no record exists)
  SELECT COALESCE(matches_sent, 0) INTO v_matches_sent
  FROM daily_limits
  WHERE user_id = p_user_id AND reset_date = v_today;
  
  -- CRITICAL FIX: If no record found, v_matches_sent stays at 0 (initialized value)
  v_matches_sent := COALESCE(v_matches_sent, 0);

  -- Get monthly messages sent (default 0 if no record exists)
  SELECT COALESCE(messages_sent, 0) INTO v_messages_sent
  FROM monthly_message_limits
  WHERE user_id = p_user_id AND reset_month = v_current_month;
  
  -- CRITICAL FIX: If no record found, v_messages_sent stays at 0 (initialized value)
  v_messages_sent := COALESCE(v_messages_sent, 0);

  -- Get projects count
  SELECT COUNT(*) INTO v_projects_count
  FROM projects
  WHERE owner_id = p_user_id;

  -- Return results
  RETURN QUERY SELECT 
    v_tier,
    v_is_premium,
    GREATEST(0, v_daily_limit - v_matches_sent),
    GREATEST(0, v_monthly_msg_limit - v_messages_sent),
    v_projects_count::integer,
    v_max_projects,
    (v_projects_count < v_max_projects);
END;
$$;