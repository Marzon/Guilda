-- Atualizar função get_subscription_info para considerar ACTIVE e GRADUATED (não ENROLLED)
-- Usuários ENROLLED, DROPPED ou REMOVED são FREE
-- Apenas ACTIVE (cursando) e GRADUATED (graduado) têm tier especial

CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
 RETURNS TABLE(tier text, is_premium boolean, daily_matches_remaining integer, monthly_messages_remaining integer, projects_count integer, max_projects integer, can_create_project boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  -- Get active subscription tier
  -- Apenas ACTIVE (cursando) e GRADUATED (graduado) têm tier especial
  SELECT s.tier INTO v_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.member_status IN ('ACTIVE', 'GRADUATED')
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

  -- Default to FREE if no subscription found
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
    ELSE
      v_is_premium := false;
      v_daily_limit := 1;
      v_monthly_msg_limit := 30;
      v_max_projects := 1;
  END CASE;

  -- Get matches sent today
  SELECT COALESCE(SUM(matches_sent), 0) INTO v_matches_sent
  FROM daily_limits
  WHERE user_id = p_user_id AND reset_date = v_today;

  -- Get messages sent this month
  SELECT COALESCE(SUM(messages_sent), 0) INTO v_messages_sent
  FROM monthly_message_limits
  WHERE user_id = p_user_id AND reset_month = v_month_start;

  -- Count user's projects
  SELECT COUNT(*) INTO v_projects_count
  FROM projects
  WHERE owner_id = p_user_id;

  RETURN QUERY SELECT 
    v_tier,
    v_is_premium,
    GREATEST(0, v_daily_limit - v_matches_sent),
    GREATEST(0, v_monthly_msg_limit - v_messages_sent),
    v_projects_count::integer,
    v_max_projects,
    (v_projects_count < v_max_projects);
END;
$function$;