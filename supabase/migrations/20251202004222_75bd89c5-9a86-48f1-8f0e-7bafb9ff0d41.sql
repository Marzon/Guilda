-- Function to increment referrer's invites count
CREATE OR REPLACE FUNCTION increment_referrer_invites(p_referral_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE waitlist_signups
  SET invites_used = invites_used + 1
  WHERE referral_code = p_referral_code;
END;
$$;