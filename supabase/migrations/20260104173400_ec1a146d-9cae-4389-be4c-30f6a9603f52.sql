-- Drop and recreate the get_subscription_info function with FREE monthly message limit reduced to 30
DROP FUNCTION IF EXISTS public.get_subscription_info(UUID);

CREATE FUNCTION public.get_subscription_info(p_user_id UUID)
RETURNS TABLE (
  tier TEXT,
  is_premium BOOLEAN,
  daily_matches_remaining INTEGER,
  monthly_messages_remaining INTEGER,
  projects_count INTEGER,
  max_projects INTEGER,
  can_create_project BOOLEAN
) AS $$
DECLARE
  v_tier TEXT := 'FREE';
  v_is_premium BOOLEAN := FALSE;
  v_subscription RECORD;
  v_daily_limit RECORD;
  v_monthly_limit_record RECORD;
  v_daily_matches_remaining INTEGER := 1;
  v_daily_limit_max INTEGER := 1;
  v_monthly_limit INTEGER := 30;
  v_monthly_messages_remaining INTEGER := 30;
  v_projects_count INTEGER := 0;
  v_max_projects INTEGER := 1;
  v_can_create_project BOOLEAN := TRUE;
BEGIN
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY 
    CASE tier 
      WHEN 'ALPHA' THEN 1 
      WHEN 'FOUNDER' THEN 2 
      WHEN 'ADVENTURER' THEN 3 
      WHEN 'BASIC' THEN 4
      ELSE 5 
    END
  LIMIT 1;

  IF v_subscription IS NOT NULL THEN
    v_tier := v_subscription.tier;
    v_is_premium := TRUE;
    
    IF v_tier = 'ALPHA' THEN
      v_daily_limit_max := 999;
      v_monthly_limit := 9999;
      v_max_projects := 999;
    ELSIF v_tier = 'FOUNDER' THEN
      v_daily_limit_max := 999;
      v_monthly_limit := 9999;
      v_max_projects := 999;
    ELSIF v_tier = 'ADVENTURER' THEN
      v_daily_limit_max := 10;
      v_monthly_limit := 500;
      v_max_projects := 2;
    ELSIF v_tier = 'BASIC' THEN
      v_daily_limit_max := 5;
      v_monthly_limit := 200;
      v_max_projects := 2;
    ELSE
      v_daily_limit_max := 1;
      v_monthly_limit := 30;
      v_max_projects := 1;
    END IF;
  ELSE
    v_daily_limit_max := 1;
    v_monthly_limit := 30;
    v_max_projects := 1;
  END IF;

  SELECT * INTO v_daily_limit
  FROM public.daily_limits
  WHERE user_id = p_user_id
    AND reset_date = CURRENT_DATE;

  IF v_daily_limit IS NOT NULL THEN
    v_daily_matches_remaining := GREATEST(0, v_daily_limit_max - COALESCE(v_daily_limit.matches_sent, 0));
  ELSE
    v_daily_matches_remaining := v_daily_limit_max;
  END IF;

  SELECT * INTO v_monthly_limit_record
  FROM public.monthly_message_limits
  WHERE user_id = p_user_id
    AND reset_month = DATE_TRUNC('month', CURRENT_DATE)::DATE;

  IF v_monthly_limit_record IS NOT NULL THEN
    v_monthly_messages_remaining := GREATEST(0, v_monthly_limit - COALESCE(v_monthly_limit_record.messages_sent, 0));
  ELSE
    v_monthly_messages_remaining := v_monthly_limit;
  END IF;

  SELECT COUNT(*) INTO v_projects_count
  FROM public.projects
  WHERE owner_id = p_user_id
    AND is_demo = FALSE;

  v_can_create_project := v_projects_count < v_max_projects;

  RETURN QUERY SELECT 
    v_tier,
    v_is_premium,
    v_daily_matches_remaining,
    v_monthly_messages_remaining,
    v_projects_count,
    v_max_projects,
    v_can_create_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;