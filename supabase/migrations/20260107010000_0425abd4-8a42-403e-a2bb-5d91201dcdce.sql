-- Fix user_badges RLS policy: Remove permissive INSERT policy
-- Badges should ONLY be inserted via the check_and_award_badges SECURITY DEFINER function
-- which bypasses RLS, so no INSERT policy is needed

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert user badges" ON public.user_badges;

-- Note: The check_and_award_badges function uses SECURITY DEFINER
-- which bypasses RLS, so it can still insert badges
-- Users cannot directly insert badges from the client