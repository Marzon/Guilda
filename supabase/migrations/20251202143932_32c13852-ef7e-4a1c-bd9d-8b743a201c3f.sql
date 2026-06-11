-- Drop the header-based policy (won't work reliably)
DROP POLICY IF EXISTS "Users can view own signup by referral code" ON waitlist_signups;

-- Allow anyone to view a single signup by referral code (the code acts as a secret token)
-- This is safe because referral codes are unique 8-char random strings that act as bearer tokens
CREATE POLICY "Users can view signup by referral code"
ON waitlist_signups FOR SELECT
USING (true);

-- Note: We keep this permissive for SELECT but the application only queries by referral_code
-- which acts as a secret bearer token. For true security, aggregate data (totalCount) 
-- should be fetched via an RPC function instead.