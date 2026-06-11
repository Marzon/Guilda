-- Create batch referrals count function to eliminate N+1 queries
CREATE OR REPLACE FUNCTION public.get_batch_referrals_count(user_ids uuid[])
RETURNS TABLE(user_id uuid, referrals_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_emails AS (
    SELECT u.id, au.email
    FROM unnest(user_ids) u(id)
    LEFT JOIN auth.users au ON au.id = u.id
  ),
  user_codes AS (
    SELECT ue.id, ws.referral_code
    FROM user_emails ue
    LEFT JOIN waitlist_signups ws ON LOWER(ws.email) = LOWER(ue.email)
  ),
  referral_counts AS (
    SELECT uc.id, COUNT(ws.id)::integer as count
    FROM user_codes uc
    LEFT JOIN waitlist_signups ws ON ws.referred_by = uc.referral_code AND uc.referral_code IS NOT NULL
    GROUP BY uc.id
  )
  SELECT rc.id, COALESCE(rc.count, 0)
  FROM referral_counts rc;
END;
$$;