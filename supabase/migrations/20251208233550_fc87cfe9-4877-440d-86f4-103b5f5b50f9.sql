-- Create broadcast_recipients table for tracking email opens per broadcast
CREATE TABLE public.broadcast_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID NOT NULL REFERENCES public.admin_broadcasts(id) ON DELETE CASCADE,
  user_id UUID NULL,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_broadcast_recipients_broadcast_id ON public.broadcast_recipients(broadcast_id);
CREATE INDEX idx_broadcast_recipients_user_id ON public.broadcast_recipients(user_id);
CREATE INDEX idx_broadcast_recipients_opened_at ON public.broadcast_recipients(opened_at) WHERE opened_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- Only admins can view recipients
CREATE POLICY "Admins can view broadcast recipients"
  ON public.broadcast_recipients
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage recipients (for edge functions)
CREATE POLICY "Service role can manage broadcast recipients"
  ON public.broadcast_recipients
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);