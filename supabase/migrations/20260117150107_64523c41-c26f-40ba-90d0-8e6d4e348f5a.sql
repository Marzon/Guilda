-- Recriar view com SECURITY INVOKER (mais seguro)
DROP VIEW IF EXISTS public.auth_page_testimonials;

CREATE VIEW public.auth_page_testimonials 
WITH (security_invoker = true)
AS
SELECT 
  pt.id,
  pt.user_id,
  pt.quote,
  p.username,
  p.avatar_url,
  p.archetype,
  p.offering
FROM published_testimonials pt
JOIN profiles p ON pt.user_id = p.id
WHERE p.username IN ('bruno_souto_oliveira', 'fernando', 'Marzon', 'Matheus');

-- Permitir acesso público à view
GRANT SELECT ON public.auth_page_testimonials TO anon;
GRANT SELECT ON public.auth_page_testimonials TO authenticated;