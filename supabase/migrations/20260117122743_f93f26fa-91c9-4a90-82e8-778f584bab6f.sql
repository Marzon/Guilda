-- Table for email verification tokens
CREATE TABLE public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX idx_evt_email ON public.email_verification_tokens(email);
CREATE INDEX idx_evt_token ON public.email_verification_tokens(token);

-- RLS enabled (access only via service role in edge functions)
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Function to cleanup expired tokens (can be called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_verification_tokens 
  WHERE expires_at < now() 
     OR (used_at IS NOT NULL AND created_at < now() - interval '1 day');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;