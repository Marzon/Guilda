-- Remover a view que não funciona
DROP VIEW IF EXISTS public.auth_page_testimonials;

-- Criar função RPC para buscar depoimentos da página auth (bypass RLS de forma controlada)
CREATE OR REPLACE FUNCTION public.get_auth_page_testimonials()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  quote text,
  username text,
  avatar_url text,
  archetype text,
  offering text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pt.id,
    pt.user_id,
    pt.quote,
    p.username,
    p.avatar_url,
    p.archetype::text,
    p.offering
  FROM published_testimonials pt
  JOIN profiles p ON pt.user_id = p.id
  WHERE p.username IN ('bruno_souto_oliveira', 'fernando', 'Marzon', 'Matheus')
  ORDER BY 
    CASE p.username
      WHEN 'bruno_souto_oliveira' THEN 1
      WHEN 'fernando' THEN 2
      WHEN 'Marzon' THEN 3
      WHEN 'Matheus' THEN 4
    END;
$$;

-- Permitir acesso público à função
GRANT EXECUTE ON FUNCTION public.get_auth_page_testimonials() TO anon;
GRANT EXECUTE ON FUNCTION public.get_auth_page_testimonials() TO authenticated;