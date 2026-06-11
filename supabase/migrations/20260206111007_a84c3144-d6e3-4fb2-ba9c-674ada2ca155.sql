-- Add RLS policy for public SELECT access to active banners
CREATE POLICY "Banners ativos são públicos para leitura"
ON public.mkt_banners FOR SELECT
USING (is_active = true);