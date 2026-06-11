-- Create admin_broadcasts table for communication history
CREATE TABLE public.admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
  target_audience TEXT NOT NULL DEFAULT 'all',
  sent_by UUID REFERENCES auth.users(id),
  recipients_count INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  push_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft'
);

-- Enable RLS
ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage broadcasts
CREATE POLICY "Admins can manage broadcasts"
ON public.admin_broadcasts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for admin_broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_broadcasts;