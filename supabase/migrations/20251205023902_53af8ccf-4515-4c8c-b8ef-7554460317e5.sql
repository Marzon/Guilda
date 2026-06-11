-- Fix SECURITY DEFINER view warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profile_summary;

CREATE VIEW public.public_profile_summary 
WITH (security_invoker = on)
AS SELECT id, username, avatar_url FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profile_summary TO anon;
GRANT SELECT ON public.public_profile_summary TO authenticated;

-- Create RLS-like policy by adding a function to allow public access to minimal profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_summary(profile_ids uuid[])
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM profiles p
  WHERE p.id = ANY(profile_ids)
$$;