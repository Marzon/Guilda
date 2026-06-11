-- Fix search_path security warnings for waitlist functions
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION calculate_queue_position(signup_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invites_count INTEGER;
  signup_time TIMESTAMP WITH TIME ZONE;
  position INTEGER;
BEGIN
  SELECT invites_used, created_at INTO invites_count, signup_time
  FROM waitlist_signups
  WHERE id = signup_id;
  
  SELECT COUNT(*) INTO position
  FROM waitlist_signups
  WHERE created_at < signup_time
    OR (created_at = signup_time AND id < signup_id);
  
  position := GREATEST(1, position - (invites_count * 2));
  
  RETURN position;
END;
$$;

CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE waitlist_signups
  SET queue_position = calculate_queue_position(id);
  
  RETURN NEW;
END;
$$;