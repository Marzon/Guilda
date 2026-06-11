-- Add ALPHA tier to subscription_tier enum
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'ALPHA';

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_subscription_info(uuid);

-- Recreate function with ALPHA support
CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier subscription_tier;
  v_expires_at timestamptz;
  v_daily_matches_remaining int;
  v_monthly_messages_remaining int;
  v_projects_count int;
  v_is_premium boolean;
BEGIN
  -- Get subscription info
  SELECT tier, expires_at INTO v_tier, v_expires_at
  FROM subscriptions
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > now());
  
  -- Default to FREE if no subscription
  IF v_tier IS NULL THEN
    v_tier := 'FREE';
  END IF;
  
  -- Check if premium (FOUNDER, ADVENTURER, or ALPHA)
  v_is_premium := v_tier IN ('FOUNDER', 'ADVENTURER', 'ALPHA');
  
  -- Get daily matches remaining
  SELECT 
    CASE 
      WHEN v_is_premium THEN 999
      ELSE GREATEST(0, 5 - COALESCE(matches_sent, 0))
    END INTO v_daily_matches_remaining
  FROM daily_limits
  WHERE user_id = p_user_id
    AND reset_date = CURRENT_DATE;
  
  IF v_daily_matches_remaining IS NULL THEN
    v_daily_matches_remaining := CASE WHEN v_is_premium THEN 999 ELSE 5 END;
  END IF;
  
  -- Get monthly messages remaining
  SELECT 
    CASE 
      WHEN v_is_premium THEN 999
      ELSE GREATEST(0, 20 - COALESCE(messages_sent, 0))
    END INTO v_monthly_messages_remaining
  FROM monthly_message_limits
  WHERE user_id = p_user_id
    AND reset_month = to_char(CURRENT_DATE, 'YYYY-MM');
  
  IF v_monthly_messages_remaining IS NULL THEN
    v_monthly_messages_remaining := CASE WHEN v_is_premium THEN 999 ELSE 20 END;
  END IF;
  
  -- Get projects count
  SELECT COUNT(*) INTO v_projects_count
  FROM projects
  WHERE owner_id = p_user_id;
  
  RETURN json_build_object(
    'tier', v_tier,
    'expires_at', v_expires_at,
    'is_premium', v_is_premium,
    'daily_matches_remaining', v_daily_matches_remaining,
    'monthly_messages_remaining', v_monthly_messages_remaining,
    'projects_count', v_projects_count,
    'max_projects', CASE WHEN v_is_premium THEN 10 ELSE 1 END
  );
END;
$$;