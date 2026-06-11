
CREATE TABLE public.aceleracao_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT
);

ALTER TABLE public.aceleracao_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insert anônimo" ON public.aceleracao_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
