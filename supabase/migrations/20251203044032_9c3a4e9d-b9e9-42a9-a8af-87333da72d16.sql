-- Function to get user's referral code from waitlist
CREATE OR REPLACE FUNCTION public.get_user_referral_code(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  referral_code_value TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF user_email IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get referral_code from waitlist
  SELECT referral_code INTO referral_code_value
  FROM waitlist_signups
  WHERE email = user_email
  LIMIT 1;
  
  RETURN referral_code_value;
END;
$$;