-- Create cohorts table
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  whatsapp_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create acceleration_applications table
CREATE TABLE public.acceleration_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  bottleneck TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  cohort_id UUID REFERENCES public.cohorts(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add cohort_id to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN cohort_id UUID REFERENCES public.cohorts(id);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceleration_applications ENABLE ROW LEVEL SECURITY;

-- Cohorts RLS: Only admins can manage
CREATE POLICY "Admins can manage cohorts"
ON public.cohorts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view cohorts"
ON public.cohorts FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Acceleration Applications RLS
CREATE POLICY "Users can insert own application"
ON public.acceleration_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own application"
ON public.acceleration_applications FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
ON public.acceleration_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
ON public.acceleration_applications FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on cohorts
CREATE TRIGGER update_cohorts_updated_at
BEFORE UPDATE ON public.cohorts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();