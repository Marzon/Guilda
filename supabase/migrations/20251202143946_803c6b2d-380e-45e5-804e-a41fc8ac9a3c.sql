-- Drop the permissive policy
DROP POLICY IF EXISTS "Users can view signup by referral code" ON waitlist_signups;

-- Create RPC function for public waitlist count (no PII exposed)
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT COUNT(*)::integer FROM waitlist_signups) + 
    (SELECT COALESCE(value, 0) FROM waitlist_config WHERE key = 'counter_offset'),
    0
  )
$$;

-- Create RPC function for getting signup by referral code (referral code acts as bearer token)
CREATE OR REPLACE FUNCTION public.get_waitlist_signup(p_referral_code text)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  referral_code text,
  referred_by text,
  invites_used integer,
  queue_position integer,
  approved boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, name, referral_code, referred_by, invites_used, queue_position, approved, created_at
  FROM waitlist_signups
  WHERE waitlist_signups.referral_code = p_referral_code
  LIMIT 1
$$;

-- Create RPC function for getting referrals count
CREATE OR REPLACE FUNCTION public.get_waitlist_referrals_count(p_referral_code text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM waitlist_signups WHERE referred_by = p_referral_code
$$;