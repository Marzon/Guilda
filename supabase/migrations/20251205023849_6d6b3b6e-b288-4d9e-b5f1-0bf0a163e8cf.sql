-- 1. Create a minimal public view for project owner info (used in /discover page)
CREATE OR REPLACE VIEW public.public_profile_summary AS
SELECT id, username, avatar_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profile_summary TO anon;
GRANT SELECT ON public.public_profile_summary TO authenticated;

-- 2. Update profiles RLS - remove public access, require authentication
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Update pix_config RLS - require authentication
DROP POLICY IF EXISTS "Anyone can view pix config" ON public.pix_config;

CREATE POLICY "Authenticated users can view pix config"
ON public.pix_config
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Remove dangerous waitlist_config UPDATE policy (SECURITY DEFINER function bypasses RLS)
DROP POLICY IF EXISTS "Allow decrement function to update config" ON public.waitlist_config;