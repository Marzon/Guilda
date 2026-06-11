
-- Create a generic leads table for tool email captures
CREATE TABLE public.tool_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public tool, no auth required)
CREATE POLICY "Anyone can insert tool leads"
  ON public.tool_leads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read tool leads"
  ON public.tool_leads
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Index for admin queries
CREATE INDEX idx_tool_leads_tool_id ON public.tool_leads (tool_id);
CREATE INDEX idx_tool_leads_created_at ON public.tool_leads (created_at DESC);
