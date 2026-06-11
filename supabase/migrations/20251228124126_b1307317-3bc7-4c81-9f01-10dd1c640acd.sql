-- Add BASIC to subscription_tier enum
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'BASIC';

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_subscription_info(uuid);

-- Recreate function to handle BASIC as premium tier
CREATE FUNCTION public.get_subscription_info(p_user_id uuid)
RETURNS TABLE(
  tier subscription_tier,
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
  v_tier subscription_tier;
  v_daily_limit integer;
  v_matches_sent integer;
  v_monthly_limit integer;
  v_messages_sent integer;
  v_projects_count integer;
  v_max_projects integer;
BEGIN
  -- Get current subscription tier
  SELECT COALESCE(s.tier, 'FREE')
  INTO v_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND (s.expires_at IS NULL OR s.expires_at > now())
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_tier IS NULL THEN
    v_tier := 'FREE';
  END IF;

  -- Set daily match limit based on tier
  CASE v_tier
    WHEN 'ALPHA' THEN v_daily_limit := 999999;
    WHEN 'BASIC' THEN v_daily_limit := 999999;
    WHEN 'FOUNDER' THEN v_daily_limit := 999999;
    WHEN 'ADVENTURER' THEN v_daily_limit := 5;
    ELSE v_daily_limit := 1;
  END CASE;

  -- Set monthly message limit based on tier
  CASE v_tier
    WHEN 'ALPHA' THEN v_monthly_limit := 999999;
    WHEN 'BASIC' THEN v_monthly_limit := 999999;
    WHEN 'FOUNDER' THEN v_monthly_limit := 999999;
    WHEN 'ADVENTURER' THEN v_monthly_limit := 500;
    ELSE v_monthly_limit := 100;
  END CASE;

  -- Set max projects based on tier
  CASE v_tier
    WHEN 'ALPHA' THEN v_max_projects := 10;
    WHEN 'BASIC' THEN v_max_projects := 10;
    WHEN 'FOUNDER' THEN v_max_projects := 5;
    WHEN 'ADVENTURER' THEN v_max_projects := 3;
    ELSE v_max_projects := 1;
  END CASE;

  -- Get matches sent today
  SELECT COALESCE(d.matches_sent, 0)
  INTO v_matches_sent
  FROM daily_limits d
  WHERE d.user_id = p_user_id AND d.reset_date = CURRENT_DATE;

  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;

  -- Get messages sent this month
  SELECT COALESCE(m.messages_sent, 0)
  INTO v_messages_sent
  FROM monthly_message_limits m
  WHERE m.user_id = p_user_id AND m.reset_month = date_trunc('month', CURRENT_DATE);

  IF v_messages_sent IS NULL THEN
    v_messages_sent := 0;
  END IF;

  -- Get projects count
  SELECT COUNT(*)::integer
  INTO v_projects_count
  FROM projects p
  WHERE p.owner_id = p_user_id;

  RETURN QUERY SELECT
    v_tier,
    v_tier IN ('ADVENTURER', 'FOUNDER', 'ALPHA', 'BASIC'),
    GREATEST(0, v_daily_limit - v_matches_sent),
    GREATEST(0, v_monthly_limit - v_messages_sent),
    v_projects_count,
    v_max_projects,
    v_projects_count < v_max_projects;
END;
$$;