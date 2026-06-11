-- Fix: Restrict profile_boosts visibility to own records only
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Everyone can view active boosts" ON public.profile_boosts;

-- Users can only view their own boost records (includes payment details)
CREATE POLICY "Users can view their own boosts"
ON public.profile_boosts
FOR SELECT
USING (auth.uid() = user_id);

-- Create a secure function to check if a user is boosted (no payment data exposed)
CREATE OR REPLACE FUNCTION public.is_user_boosted(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_boosts
    WHERE user_id = p_user_id
      AND expires_at > now()
  )
$$;