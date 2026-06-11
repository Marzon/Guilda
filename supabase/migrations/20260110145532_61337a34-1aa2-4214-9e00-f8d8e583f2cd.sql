-- Drop and recreate get_subscription_info function with increased FREE tier limit (30 -> 100)
DROP FUNCTION IF EXISTS public.get_subscription_info(uuid);

CREATE FUNCTION public.get_subscription_info(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_daily_limit RECORD;
  v_monthly_limit_record RECORD;
  v_daily_matches_remaining INTEGER := 1;
  v_daily_limit_max INTEGER := 1;
  v_monthly_limit INTEGER := 100;
  v_monthly_messages_remaining INTEGER := 100;
  v_projects_count INTEGER := 0;
  v_max_projects INTEGER := 1;
  v_can_create_project BOOLEAN := TRUE;
BEGIN
  -- Get active subscription
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Get daily limits
  SELECT * INTO v_daily_limit
  FROM public.daily_limits
  WHERE user_id = p_user_id
    AND reset_date = CURRENT_DATE;

  -- Get monthly message count
  SELECT * INTO v_monthly_limit_record
  FROM public.monthly_message_limits
  WHERE user_id = p_user_id
    AND reset_month = date_trunc('month', CURRENT_DATE)::date;

  -- Get projects count
  SELECT COUNT(*) INTO v_projects_count
  FROM public.projects
  WHERE owner_id = p_user_id;

  -- Calculate limits based on subscription tier
  IF v_subscription IS NOT NULL THEN
    IF v_subscription.tier = 'ADVENTURER' THEN
      v_daily_limit_max := 5;
      v_monthly_limit := 100;
      v_max_projects := 2;
    ELSIF v_subscription.tier = 'FOUNDER' THEN
      v_daily_limit_max := 20;
      v_monthly_limit := 200;
      v_max_projects := 2;
    ELSE
      v_daily_limit_max := 1;
      v_monthly_limit := 100;
      v_max_projects := 1;
    END IF;
  ELSE
    v_daily_limit_max := 1;
    v_monthly_limit := 100;
    v_max_projects := 1;
  END IF;

  -- Calculate remaining daily matches
  IF v_daily_limit IS NOT NULL THEN
    v_daily_matches_remaining := GREATEST(0, v_daily_limit_max - COALESCE(v_daily_limit.matches_sent, 0));
  ELSE
    v_daily_matches_remaining := v_daily_limit_max;
  END IF;

  -- Calculate remaining monthly messages
  IF v_monthly_limit_record IS NOT NULL THEN
    v_monthly_messages_remaining := GREATEST(0, v_monthly_limit - COALESCE(v_monthly_limit_record.messages_sent, 0));
  ELSE
    v_monthly_messages_remaining := v_monthly_limit;
  END IF;

  -- Check if can create project
  v_can_create_project := v_projects_count < v_max_projects;

  RETURN jsonb_build_object(
    'tier', COALESCE(v_subscription.tier, 'FREE'),
    'isPremium', v_subscription IS NOT NULL,
    'dailyMatchesRemaining', v_daily_matches_remaining,
    'canSendMatch', v_daily_matches_remaining > 0,
    'monthlyMessagesRemaining', v_monthly_messages_remaining,
    'canSendMessage', v_monthly_messages_remaining > 0,
    'projectsCount', v_projects_count,
    'maxProjects', v_max_projects,
    'canCreateProject', v_can_create_project
  );
END;
$$;