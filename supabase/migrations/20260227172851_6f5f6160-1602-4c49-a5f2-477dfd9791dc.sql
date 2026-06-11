
CREATE TABLE public.aceleracao_inscritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Enable RLS
ALTER TABLE public.aceleracao_inscritos ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public landing page form)
CREATE POLICY "Anyone can insert signup" 
ON public.aceleracao_inscritos 
FOR INSERT 
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read signups" 
ON public.aceleracao_inscritos 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create unique index on telefone to handle deduplication silently
CREATE UNIQUE INDEX idx_aceleracao_inscritos_telefone ON public.aceleracao_inscritos (telefone);
