-- Funções para incrementar contadores de banners
CREATE OR REPLACE FUNCTION public.increment_banner_views(banner_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE banners SET views_count = views_count + 1 WHERE id = banner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_banner_clicks(banner_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE banners SET clicks_count = clicks_count + 1 WHERE id = banner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_banner_dismisses(banner_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE banners SET dismisses_count = dismisses_count + 1 WHERE id = banner_id;
END;
$$;