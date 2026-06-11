-- Add batch_manager to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'batch_manager';

-- Create cohort_managers table
CREATE TABLE IF NOT EXISTS public.cohort_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, user_id)
);

-- Enable RLS
ALTER TABLE public.cohort_managers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cohort_managers
CREATE POLICY "Admins can manage cohort_managers"
ON public.cohort_managers FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Batch managers can view their assignments"
ON public.cohort_managers FOR SELECT
USING (user_id = auth.uid());

-- Function to check if user is batch manager of any cohort
CREATE OR REPLACE FUNCTION public.is_batch_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cohort_managers
    WHERE user_id = _user_id
  )
$$;

-- Function to check if user can manage a specific cohort
CREATE OR REPLACE FUNCTION public.can_manage_cohort(_user_id uuid, _cohort_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(_user_id, 'admin'::public.app_role) 
    OR EXISTS (
      SELECT 1 FROM public.cohort_managers
      WHERE user_id = _user_id AND cohort_id = _cohort_id
    )
$$;

-- Drop and recreate get_subscription_info to check admin FIRST
DROP FUNCTION IF EXISTS public.get_subscription_info(uuid);

CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
RETURNS TABLE(
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_is_admin boolean := false;
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
  -- FIRST: Check if user is admin - ADMIN HAS ACCESS TO EVERYTHING with FOUNDER tier
  SELECT public.has_role(p_user_id, 'admin'::public.app_role) INTO v_is_admin;
  
  IF v_is_admin THEN
    -- Count user's projects
    SELECT COUNT(*) INTO v_projects_count FROM projects WHERE owner_id = p_user_id;
    
    -- Admin gets FOUNDER tier with full access
    RETURN QUERY SELECT 
      'FOUNDER'::text,
      true,
      999999,
      999999,
      v_projects_count::integer,
      10,
      true;
    RETURN;
  END IF;

  -- Get active subscription tier (for non-admins)
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

-- Update RLS for cohorts to allow batch managers to view/update their cohorts
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;

CREATE POLICY "Admins can manage cohorts"
ON public.cohorts FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Batch managers can view their cohorts"
ON public.cohorts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cohort_managers 
    WHERE cohort_id = cohorts.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Batch managers can update their cohorts"
ON public.cohorts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.cohort_managers 
    WHERE cohort_id = cohorts.id AND user_id = auth.uid()
  )
);