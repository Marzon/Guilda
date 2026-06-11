
-- Create link_clicks table for tracking button clicks on /links page
CREATE TABLE public.link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  button_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- INSERT allowed for everyone (including anon)
CREATE POLICY "Anyone can insert link clicks"
  ON public.link_clicks
  FOR INSERT
  WITH CHECK (true);

-- SELECT allowed for authenticated users only
CREATE POLICY "Authenticated users can view link clicks"
  ON public.link_clicks
  FOR SELECT
  USING (auth.role() = 'authenticated');
