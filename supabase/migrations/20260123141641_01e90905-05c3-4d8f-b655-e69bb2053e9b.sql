-- Drop existing unique constraint on cohort_id to allow multiple agents per cohort
ALTER TABLE acceleration_agent_config 
DROP CONSTRAINT IF EXISTS acceleration_agent_config_cohort_id_key;

-- Create unique composite index for cohort_id + agent_type
CREATE UNIQUE INDEX idx_unique_agent_per_cohort_type 
ON acceleration_agent_config(cohort_id, agent_type);

-- Create table for storing pivot analysis results
CREATE TABLE public.acceleration_pivot_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.acceleration_submissions(id) ON DELETE SET NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, cohort_id)
);

-- Enable RLS
ALTER TABLE public.acceleration_pivot_analysis ENABLE ROW LEVEL SECURITY;

-- Users can view their own analysis
CREATE POLICY "Users can view own pivot analysis"
ON public.acceleration_pivot_analysis
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own analysis
CREATE POLICY "Users can insert own pivot analysis"
ON public.acceleration_pivot_analysis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own analysis
CREATE POLICY "Users can update own pivot analysis"
ON public.acceleration_pivot_analysis
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins and batch managers can view all
CREATE POLICY "Admins can view all pivot analysis"
ON public.acceleration_pivot_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'batch_manager')
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_acceleration_pivot_analysis_updated_at
BEFORE UPDATE ON public.acceleration_pivot_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();