-- Create mkt_banners table for Marketing-only banners (separate from Core App)
CREATE TABLE IF NOT EXISTS public.mkt_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cta_text TEXT,
  cta_link TEXT,
  secondary_cta_text TEXT,
  secondary_cta_link TEXT,
  icon TEXT,
  image_url TEXT,
  type TEXT NOT NULL DEFAULT 'top_bar' CHECK (type IN ('top_bar', 'modal', 'floating', 'inline')),
  variant TEXT NOT NULL DEFAULT 'default' CHECK (variant IN ('default', 'success', 'warning', 'info', 'gradient', 'custom')),
  custom_gradient TEXT,
  custom_bg_color TEXT,
  custom_text_color TEXT,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'anonymous', 'authenticated', 'free', 'premium')),
  pages TEXT[] DEFAULT '{}',
  exclude_pages TEXT[] DEFAULT '{}',
  is_dismissible BOOLEAN DEFAULT true,
  dismiss_duration_hours INTEGER DEFAULT 24,
  show_once_per_session BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  dismisses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.mkt_banners ENABLE ROW LEVEL SECURITY;

-- Public read for active banners
CREATE POLICY "Public can read active mkt_banners"
  ON public.mkt_banners FOR SELECT
  USING (is_active = true);

-- Admin can do everything
CREATE POLICY "Admins can manage mkt_banners"
  ON public.mkt_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_mkt_banners_updated_at
  BEFORE UPDATE ON public.mkt_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create banner dismissals for Marketing
CREATE TABLE IF NOT EXISTS public.mkt_banner_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES public.mkt_banners(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(banner_id, user_id),
  UNIQUE(banner_id, session_id)
);

-- Enable RLS
ALTER TABLE public.mkt_banner_dismissals ENABLE ROW LEVEL SECURITY;

-- Users can manage their own dismissals
CREATE POLICY "Users can manage own mkt_banner_dismissals"
  ON public.mkt_banner_dismissals FOR ALL
  USING (user_id = auth.uid() OR session_id IS NOT NULL);

-- RPCs for incrementing counts
CREATE OR REPLACE FUNCTION public.increment_mkt_banner_views(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mkt_banners SET views_count = views_count + 1 WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_mkt_banner_clicks(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mkt_banners SET clicks_count = clicks_count + 1 WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_mkt_banner_dismisses(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mkt_banners SET dismisses_count = dismisses_count + 1 WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;