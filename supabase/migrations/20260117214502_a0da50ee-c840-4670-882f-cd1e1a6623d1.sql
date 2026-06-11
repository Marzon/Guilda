-- Table for founder archetype analysis
CREATE TABLE public.founder_archetype_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  archetype TEXT NOT NULL CHECK (archetype IN ('BUILDER_ADDICT', 'PREMATURE_CEO', 'FAKER', 'CYCLOTHYMIC', 'UNKNOWN')),
  confidence_score DECIMAL(3,2) DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  indicators JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cohort_id)
);

-- Table for founder trap alerts
CREATE TABLE public.founder_trap_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  trap_type TEXT NOT NULL CHECK (trap_type IN ('NICHE_FEAR', 'LP_DESERT', 'PIVOT_ADDICTION', 'MOM_VALIDATION', 'SYNTHETIC_VALIDATION', 'PREMATURE_SCALE', 'SILENCE_ALERT', 'FAKE_WORK', 'VANITY_MARKETING')),
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  trigger_data JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founder_archetype_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_trap_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for founder_archetype_analysis
CREATE POLICY "Admins can view all archetype analysis"
ON public.founder_archetype_analysis FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Cohort managers can view their cohort archetype analysis"
ON public.founder_archetype_analysis FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cohort_managers cm
    WHERE cm.user_id = auth.uid()
    AND cm.cohort_id = founder_archetype_analysis.cohort_id
  )
);

CREATE POLICY "Users can view their own archetype analysis"
ON public.founder_archetype_analysis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage archetype analysis"
ON public.founder_archetype_analysis FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role');

-- RLS policies for founder_trap_alerts
CREATE POLICY "Admins can view all trap alerts"
ON public.founder_trap_alerts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Cohort managers can view their cohort trap alerts"
ON public.founder_trap_alerts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cohort_managers cm
    WHERE cm.user_id = auth.uid()
    AND cm.cohort_id = founder_trap_alerts.cohort_id
  )
);

CREATE POLICY "Users can view their own trap alerts"
ON public.founder_trap_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage trap alerts"
ON public.founder_trap_alerts FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admins can manage trap alerts"
ON public.founder_trap_alerts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_archetype_analysis_user_cohort ON public.founder_archetype_analysis(user_id, cohort_id);
CREATE INDEX idx_trap_alerts_user_cohort ON public.founder_trap_alerts(user_id, cohort_id);
CREATE INDEX idx_trap_alerts_unresolved ON public.founder_trap_alerts(user_id, cohort_id) WHERE resolved = false;

-- Trigger to update last_updated_at
CREATE TRIGGER update_founder_archetype_analysis_updated_at
BEFORE UPDATE ON public.founder_archetype_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();