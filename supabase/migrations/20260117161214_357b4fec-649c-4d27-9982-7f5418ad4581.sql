-- 1. Restringir email_rate_limits ao service_role
DROP POLICY IF EXISTS "System can manage all rate limits" ON public.email_rate_limits;

CREATE POLICY "Service role can manage rate limits"
ON public.email_rate_limits
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- 2. Restringir pending_email_digests ao service_role
DROP POLICY IF EXISTS "System can manage all digests" ON public.pending_email_digests;

CREATE POLICY "Service role can manage digests"
ON public.pending_email_digests
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- 3. Restringir profile_boosts ao service_role
DROP POLICY IF EXISTS "Service role can manage boosts" ON public.profile_boosts;

CREATE POLICY "Service role can manage boosts"
ON public.profile_boosts
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');