-- Create email_leads table for soft-gate lead capture
CREATE TABLE IF NOT EXISTS public.email_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  calculation_data JSONB,
  source TEXT DEFAULT 'soft_gate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Create saved_calculations table for logged-in users
CREATE TABLE IF NOT EXISTS public.saved_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  title TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

-- RLS for email_leads: Only service role can manage
CREATE POLICY "Service role can manage email leads" ON public.email_leads
  FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role');

-- Allow anonymous inserts for lead capture
CREATE POLICY "Anyone can submit email leads" ON public.email_leads
  FOR INSERT WITH CHECK (true);

-- RLS for saved_calculations: Users manage their own
CREATE POLICY "Users can view own calculations" ON public.saved_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON public.saved_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations" ON public.saved_calculations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON public.saved_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_calculations_user_id ON public.saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_calculations_tool ON public.saved_calculations(tool_name);
CREATE INDEX IF NOT EXISTS idx_email_leads_email ON public.email_leads(email);

-- Trigger to update updated_at
CREATE TRIGGER update_saved_calculations_updated_at
  BEFORE UPDATE ON public.saved_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();