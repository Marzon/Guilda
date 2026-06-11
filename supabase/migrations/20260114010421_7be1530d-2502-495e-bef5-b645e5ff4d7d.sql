-- Create a view that exposes published testimonials with user data for public access
CREATE OR REPLACE VIEW public.published_testimonials_with_users AS
SELECT 
  pt.id,
  pt.quote,
  pt.partnership_type,
  pt.is_featured,
  pt.display_order,
  pt.display_pages,
  pt.created_at,
  pt.project_id,
  -- User data
  pt.user_id,
  p1.username as user_username,
  p1.avatar_url as user_avatar_url,
  p1.archetype as user_archetype,
  -- Partner data
  pt.partner_id,
  p2.username as partner_username,
  p2.avatar_url as partner_avatar_url,
  p2.archetype as partner_archetype,
  -- Project data
  proj.title as project_title
FROM public.published_testimonials pt
LEFT JOIN public.profiles p1 ON pt.user_id = p1.id
LEFT JOIN public.profiles p2 ON pt.partner_id = p2.id
LEFT JOIN public.projects proj ON pt.project_id = proj.id;

-- Grant public read access to the view
GRANT SELECT ON public.published_testimonials_with_users TO anon, authenticated;