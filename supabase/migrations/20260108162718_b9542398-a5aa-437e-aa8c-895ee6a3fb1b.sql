-- Create investments table for investor track record
CREATE TABLE public.investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  startup_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for queries by investor
CREATE INDEX idx_investments_investor_id ON public.investments(investor_id);

-- Enable RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view investments (for the Capital vitrine)
CREATE POLICY "Anyone can view investments" ON public.investments
  FOR SELECT USING (true);

-- Users can insert their own investments
CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Users can update their own investments
CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = investor_id);

-- Users can delete their own investments
CREATE POLICY "Users can delete own investments" ON public.investments
  FOR DELETE USING (auth.uid() = investor_id);