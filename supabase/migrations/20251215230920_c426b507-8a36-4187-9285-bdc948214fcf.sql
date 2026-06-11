-- Create user_referrals table to replace waitlist referral tracking
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT NULL, -- referral_code of the referrer
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX user_referrals_user_id_idx ON public.user_referrals(user_id);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral
CREATE POLICY "Users can view own referral" ON public.user_referrals
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own referral (on signup)
CREATE POLICY "Users can insert own referral" ON public.user_referrals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can manage all referrals
CREATE POLICY "Service role can manage referrals" ON public.user_referrals
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Authenticated users can view referral codes (for counting)
CREATE POLICY "Authenticated can view referral codes" ON public.user_referrals
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_user_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM user_referrals WHERE referral_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$;

-- Function to get or create user referral code
CREATE OR REPLACE FUNCTION public.get_or_create_user_referral(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Try to find existing referral code
  SELECT referral_code INTO v_code
  FROM user_referrals
  WHERE user_id = p_user_id;
  
  -- If found, return it
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;
  
  -- Generate new code
  v_code := generate_user_referral_code();
  
  -- Insert new referral record
  INSERT INTO user_referrals (user_id, referral_code)
  VALUES (p_user_id, v_code)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Return the code (either newly created or existing from race condition)
  SELECT referral_code INTO v_code
  FROM user_referrals
  WHERE user_id = p_user_id;
  
  RETURN v_code;
END;
$$;

-- Function to count referrals for a user
CREATE OR REPLACE FUNCTION public.count_user_referrals(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_count INTEGER;
BEGIN
  -- Get user's referral code
  SELECT referral_code INTO v_code
  FROM user_referrals
  WHERE user_id = p_user_id;
  
  IF v_code IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count how many users were referred by this code
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM user_referrals
  WHERE referred_by = v_code;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Batch function for getting referral counts (for Tavern efficiency)
CREATE OR REPLACE FUNCTION public.get_batch_user_referrals(user_ids UUID[])
RETURNS TABLE(user_id UUID, referrals_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_codes AS (
    SELECT ur.user_id, ur.referral_code
    FROM user_referrals ur
    WHERE ur.user_id = ANY(user_ids)
  ),
  referral_counts AS (
    SELECT uc.user_id, COUNT(ur.id)::INTEGER as count
    FROM user_codes uc
    LEFT JOIN user_referrals ur ON ur.referred_by = uc.referral_code
    GROUP BY uc.user_id
  )
  SELECT 
    u.id as user_id,
    COALESCE(rc.count, 0) as referrals_count
  FROM unnest(user_ids) u(id)
  LEFT JOIN referral_counts rc ON rc.user_id = u.id;
END;
$$;

-- Trigger to create referral code on profile creation
CREATE OR REPLACE FUNCTION public.create_referral_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create referral record for new user
  INSERT INTO user_referrals (user_id, referral_code)
  VALUES (NEW.id, generate_user_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_on_profile();