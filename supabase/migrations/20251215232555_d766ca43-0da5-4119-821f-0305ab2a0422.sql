-- Remove the admin SELECT policy that exposes customer emails
-- Only service role should access this table for broadcast operations

DROP POLICY IF EXISTS "Admins can view broadcast recipients" ON public.broadcast_recipients;

-- The "Service role can manage broadcast recipients" policy remains - this is the correct pattern
-- Service role is used by Edge Functions for broadcast operations, not exposed to client-side