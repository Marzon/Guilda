-- Fix the security definer view warning by using SECURITY INVOKER explicitly
-- Drop and recreate the view with proper security configuration
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  archetype,
  bio,
  stats,
  xp_level,
  avatar_url,
  created_at,
  last_seen_at,
  is_online,
  looking_for,
  offering,
  main_skills,
  auto_accept_matches,
  dnd_until,
  signup_source,
  signup_source_other,
  investor_type,
  investor_sectors,
  investor_check_range,
  -- Phone is only visible to the profile owner
  CASE 
    WHEN auth.uid() = id THEN phone
    ELSE NULL
  END as phone
FROM public.profiles;

-- Grant access to authenticated users only
GRANT SELECT ON public.public_profiles TO authenticated;
REVOKE ALL ON public.public_profiles FROM anon;