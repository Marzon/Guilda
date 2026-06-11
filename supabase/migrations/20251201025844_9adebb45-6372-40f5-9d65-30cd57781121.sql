-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('FREE', 'FOUNDER');

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tier subscription_tier DEFAULT 'FREE',
    purchased_at TIMESTAMP WITH TIME ZONE,
    paypal_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily limits table
CREATE TABLE daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    matches_sent INTEGER DEFAULT 0,
    reset_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, reset_date)
);

-- Create profile boosts table
CREATE TABLE profile_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paypal_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_boosts ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON subscriptions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- RLS policies for daily_limits
CREATE POLICY "Users can view their own limits"
ON daily_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own limits"
ON daily_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own limits"
ON daily_limits FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for profile_boosts
CREATE POLICY "Everyone can view active boosts"
ON profile_boosts FOR SELECT
USING (expires_at > now());

CREATE POLICY "Service role can manage boosts"
ON profile_boosts FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Function to check daily limit
CREATE OR REPLACE FUNCTION check_daily_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_matches_sent INTEGER;
BEGIN
  -- Check user tier
  SELECT tier INTO v_tier FROM subscriptions WHERE user_id = p_user_id;
  
  -- If no subscription record, create one with FREE tier
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  -- Founder tier has unlimited matches
  IF v_tier = 'FOUNDER' THEN
    RETURN TRUE;
  END IF;
  
  -- Check today's limit for FREE tier
  SELECT matches_sent INTO v_matches_sent 
  FROM daily_limits 
  WHERE user_id = p_user_id AND reset_date = CURRENT_DATE;
  
  -- If no record for today, create one
  IF v_matches_sent IS NULL THEN
    INSERT INTO daily_limits (user_id, matches_sent, reset_date)
    VALUES (p_user_id, 0, CURRENT_DATE);
    RETURN TRUE;
  END IF;
  
  -- Check if under limit (3 matches per day for FREE)
  RETURN v_matches_sent < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment daily matches
CREATE OR REPLACE FUNCTION increment_daily_matches(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_limits (user_id, matches_sent, reset_date)
  VALUES (p_user_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id, reset_date) 
  DO UPDATE SET matches_sent = daily_limits.matches_sent + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription info
CREATE OR REPLACE FUNCTION get_subscription_info(p_user_id UUID)
RETURNS TABLE (
  tier subscription_tier,
  is_premium BOOLEAN,
  daily_matches_remaining INTEGER,
  is_boosted BOOLEAN,
  boost_expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_tier subscription_tier;
  v_matches_sent INTEGER;
  v_boost_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get tier
  SELECT s.tier INTO v_tier FROM subscriptions s WHERE s.user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  -- Get matches sent today
  SELECT dl.matches_sent INTO v_matches_sent 
  FROM daily_limits dl 
  WHERE dl.user_id = p_user_id AND dl.reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;
  
  -- Get boost info
  SELECT pb.expires_at INTO v_boost_expires
  FROM profile_boosts pb
  WHERE pb.user_id = p_user_id AND pb.expires_at > now()
  ORDER BY pb.expires_at DESC
  LIMIT 1;
  
  RETURN QUERY SELECT
    v_tier,
    v_tier = 'FOUNDER',
    CASE WHEN v_tier = 'FOUNDER' THEN 999999 ELSE GREATEST(0, 3 - v_matches_sent) END,
    v_boost_expires IS NOT NULL,
    v_boost_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;