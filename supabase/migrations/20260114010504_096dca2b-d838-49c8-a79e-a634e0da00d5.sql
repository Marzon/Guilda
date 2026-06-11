-- Drop the view we created (it won't work with security_invoker due to profiles RLS)
DROP VIEW IF EXISTS public.published_testimonials_with_users;

-- Create a function that returns testimonials with user data (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_public_testimonials(
  p_page TEXT DEFAULT 'home',
  p_limit INTEGER DEFAULT 9,
  p_featured_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  quote TEXT,
  partnership_type TEXT,
  is_featured BOOLEAN,
  display_pages TEXT[],
  user_id UUID,
  user_username TEXT,
  user_avatar_url TEXT,
  user_archetype TEXT,
  partner_id UUID,
  partner_username TEXT,
  partner_avatar_url TEXT,
  partner_archetype TEXT,
  project_id UUID,
  project_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.quote,
    pt.partnership_type,
    pt.is_featured,
    pt.display_pages,
    pt.user_id,
    p1.username::TEXT as user_username,
    p1.avatar_url::TEXT as user_avatar_url,
    p1.archetype::TEXT as user_archetype,
    pt.partner_id,
    p2.username::TEXT as partner_username,
    p2.avatar_url::TEXT as partner_avatar_url,
    p2.archetype::TEXT as partner_archetype,
    pt.project_id,
    proj.title::TEXT as project_title
  FROM public.published_testimonials pt
  LEFT JOIN public.profiles p1 ON pt.user_id = p1.id
  LEFT JOIN public.profiles p2 ON pt.partner_id = p2.id
  LEFT JOIN public.projects proj ON pt.project_id = proj.id
  WHERE p_page = ANY(pt.display_pages)
    AND (NOT p_featured_only OR pt.is_featured = true)
  ORDER BY pt.display_order ASC NULLS LAST, pt.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_testimonials TO anon, authenticated;