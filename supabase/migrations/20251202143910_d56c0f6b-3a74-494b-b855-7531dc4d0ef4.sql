-- Drop the overly permissive policy that exposes PII
DROP POLICY IF EXISTS "Anyone can view signups" ON waitlist_signups;

-- Admins can view all signups (uses existing has_role function)
CREATE POLICY "Admins can view all signups"
ON waitlist_signups FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own signup by referral code (stored in localStorage after signup)
CREATE POLICY "Users can view own signup by referral code"
ON waitlist_signups FOR SELECT
USING (referral_code = current_setting('request.headers', true)::json->>'x-referral-code');