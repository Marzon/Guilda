-- 1. Drop the problematic public policy that exposes all profile data
DROP POLICY IF EXISTS "Public can view profiles for jobs" ON public.profiles;

-- 2. Create a secure function to get profile data (masks phone for non-owners)
CREATE OR REPLACE FUNCTION public.get_safe_profile_phone(profile_id uuid, profile_phone text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() = profile_id THEN profile_phone
    WHEN auth.uid() IS NULL THEN NULL
    ELSE NULL -- Only owner can see their own phone
  END;
$$;

-- 3. Create a secure view for public profile data (masks phone for non-owners)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- 4. Grant access to the view for authenticated users only
GRANT SELECT ON public.public_profiles TO authenticated;

-- 5. Revoke public access to the view
REVOKE ALL ON public.public_profiles FROM anon;