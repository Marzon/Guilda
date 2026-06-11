-- Create table to track viewed profiles
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(viewer_id, viewed_profile_id)
);

-- Index for fast lookup by viewer
CREATE INDEX idx_profile_views_viewer ON public.profile_views(viewer_id);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own views
CREATE POLICY "Users can view own profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = viewer_id);

-- Users can insert their own views
CREATE POLICY "Users can insert own profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Users can delete their own views (to clear history)
CREATE POLICY "Users can delete own profile views"
  ON public.profile_views FOR DELETE
  USING (auth.uid() = viewer_id);