-- Create waitlist signups table
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT,
  invites_used INTEGER NOT NULL DEFAULT 0,
  queue_position INTEGER NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their signup
CREATE POLICY "Anyone can sign up for waitlist"
ON public.waitlist_signups
FOR INSERT
WITH CHECK (true);

-- Anyone can view their own signup by referral code
CREATE POLICY "Anyone can view signups"
ON public.waitlist_signups
FOR SELECT
USING (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM waitlist_signups WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Function to calculate queue position based on invites
CREATE OR REPLACE FUNCTION calculate_queue_position(signup_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  invites_count INTEGER;
  signup_time TIMESTAMP WITH TIME ZONE;
  position INTEGER;
BEGIN
  SELECT invites_used, created_at INTO invites_count, signup_time
  FROM waitlist_signups
  WHERE id = signup_id;
  
  -- Position = number of people who signed up before you minus (your invites * 2)
  -- Each invite moves you up 2 positions
  SELECT COUNT(*) INTO position
  FROM waitlist_signups
  WHERE created_at < signup_time
    OR (created_at = signup_time AND id < signup_id);
  
  position := GREATEST(1, position - (invites_count * 2));
  
  RETURN position;
END;
$$;

-- Function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Recalculate positions for all signups
  UPDATE waitlist_signups
  SET queue_position = calculate_queue_position(id);
  
  RETURN NEW;
END;
$$;

-- Trigger to update positions when someone signs up or gets referrals
CREATE TRIGGER on_waitlist_change
AFTER INSERT OR UPDATE ON waitlist_signups
FOR EACH STATEMENT
EXECUTE FUNCTION update_queue_positions();

-- Add starting offset for counter (11 fake signups)
CREATE TABLE public.waitlist_config (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

INSERT INTO public.waitlist_config (key, value) VALUES ('counter_offset', 11);

ALTER TABLE public.waitlist_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view config"
ON public.waitlist_config
FOR SELECT
USING (true);