
CREATE TABLE public.quiz_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  tipo TEXT NOT NULL,
  arquetipo TEXT NOT NULL,
  lead_quality TEXT NOT NULL,
  score_x INTEGER NOT NULL,
  score_y INTEGER NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_quiz_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tipo NOT IN ('builder', 'seller') THEN
    RAISE EXCEPTION 'tipo must be builder or seller';
  END IF;
  IF NEW.lead_quality NOT IN ('hot', 'warm', 'cold') THEN
    RAISE EXCEPTION 'lead_quality must be hot, warm, or cold';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_quiz_lead_trigger
  BEFORE INSERT OR UPDATE ON public.quiz_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quiz_lead();

-- Enable RLS
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Public insert (anonymous)
CREATE POLICY "Allow public insert" ON public.quiz_leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated read (admin)
CREATE POLICY "Allow authenticated read" ON public.quiz_leads
  FOR SELECT TO authenticated
  USING (true);
