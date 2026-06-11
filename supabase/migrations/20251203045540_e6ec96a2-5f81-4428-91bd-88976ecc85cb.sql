-- Update the get_user_referral_code function to also work with users who didn't come from waitlist
-- It will first try to find from waitlist, then generate a deterministic code from user_id

CREATE OR REPLACE FUNCTION public.get_user_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_code TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try to find existing referral code from waitlist
  SELECT referral_code INTO v_code
  FROM waitlist_signups
  WHERE LOWER(email) = LOWER(v_email);
  
  -- If found, return it
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;
  
  -- If not found in waitlist, check if we need to create an entry
  -- Generate a unique code based on user_id (first 8 chars of uuid)
  v_code := UPPER(SUBSTRING(p_user_id::TEXT, 1, 8));
  
  -- Insert into waitlist if not exists (for users who bypassed waitlist)
  INSERT INTO waitlist_signups (email, name, referral_code, approved, queue_position)
  SELECT 
    v_email,
    COALESCE((SELECT username FROM profiles WHERE id = p_user_id), 'User'),
    v_code,
    TRUE,
    0
  WHERE NOT EXISTS (
    SELECT 1 FROM waitlist_signups WHERE LOWER(email) = LOWER(v_email)
  );
  
  -- Return the code (either newly created or existing)
  SELECT referral_code INTO v_code
  FROM waitlist_signups
  WHERE LOWER(email) = LOWER(v_email);
  
  RETURN v_code;
END;
$$;