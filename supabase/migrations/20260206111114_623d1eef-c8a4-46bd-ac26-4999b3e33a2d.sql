-- Create function to increment banner metrics
CREATE OR REPLACE FUNCTION public.increment_mkt_banner_metric(
  banner_id UUID,
  metric_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF metric_name = 'views_count' THEN
    UPDATE public.mkt_banners SET views_count = COALESCE(views_count, 0) + 1 WHERE id = banner_id;
  ELSIF metric_name = 'clicks_count' THEN
    UPDATE public.mkt_banners SET clicks_count = COALESCE(clicks_count, 0) + 1 WHERE id = banner_id;
  ELSIF metric_name = 'dismisses_count' THEN
    UPDATE public.mkt_banners SET dismisses_count = COALESCE(dismisses_count, 0) + 1 WHERE id = banner_id;
  END IF;
END;
$$;