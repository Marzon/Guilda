-- Create broadcast email queue table
CREATE TABLE public.broadcast_email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID NOT NULL REFERENCES public.admin_broadcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient queue processing
CREATE INDEX idx_broadcast_queue_status ON public.broadcast_email_queue(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_broadcast_queue_broadcast_id ON public.broadcast_email_queue(broadcast_id);

-- Enable RLS
ALTER TABLE public.broadcast_email_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access (used by edge functions)
CREATE POLICY "Service role only" ON public.broadcast_email_queue
  FOR ALL USING (false);

-- Add comment
COMMENT ON TABLE public.broadcast_email_queue IS 'Queue for processing broadcast emails in batches to avoid timeouts';