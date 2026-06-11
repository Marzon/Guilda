-- Create acceleration_teams table
CREATE TABLE public.acceleration_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  startup_name TEXT NOT NULL DEFAULT 'Startup sem nome',
  builder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create acceleration_task_assignments table
CREATE TABLE public.acceleration_task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.acceleration_teams(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.acceleration_tasks(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL DEFAULT 'both' CHECK (assigned_to IN ('builder', 'seller', 'both')),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, task_id)
);

-- Add team_id to acceleration_submissions
ALTER TABLE public.acceleration_submissions 
ADD COLUMN team_id UUID REFERENCES public.acceleration_teams(id) ON DELETE SET NULL;

-- Add team_id to acceleration_user_progress
ALTER TABLE public.acceleration_user_progress 
ADD COLUMN team_id UUID REFERENCES public.acceleration_teams(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_acceleration_teams_cohort ON public.acceleration_teams(cohort_id);
CREATE INDEX idx_acceleration_teams_builder ON public.acceleration_teams(builder_id);
CREATE INDEX idx_acceleration_teams_seller ON public.acceleration_teams(seller_id);
CREATE INDEX idx_acceleration_task_assignments_team ON public.acceleration_task_assignments(team_id);
CREATE INDEX idx_acceleration_submissions_team ON public.acceleration_submissions(team_id);
CREATE INDEX idx_acceleration_user_progress_team ON public.acceleration_user_progress(team_id);

-- Enable RLS on new tables
ALTER TABLE public.acceleration_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceleration_task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for acceleration_teams
CREATE POLICY "Team members can view their team"
ON public.acceleration_teams
FOR SELECT
USING (
  auth.uid() = builder_id OR 
  auth.uid() = seller_id OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Team members can update their team"
ON public.acceleration_teams
FOR UPDATE
USING (
  auth.uid() = builder_id OR 
  auth.uid() = seller_id OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can insert teams"
ON public.acceleration_teams
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete teams"
ON public.acceleration_teams
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for acceleration_task_assignments
CREATE POLICY "Team members can view task assignments"
ON public.acceleration_task_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.acceleration_teams t
    WHERE t.id = team_id AND (t.builder_id = auth.uid() OR t.seller_id = auth.uid())
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Team members can manage task assignments"
ON public.acceleration_task_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.acceleration_teams t
    WHERE t.id = team_id AND (t.builder_id = auth.uid() OR t.seller_id = auth.uid())
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update trigger for acceleration_teams
CREATE TRIGGER update_acceleration_teams_updated_at
BEFORE UPDATE ON public.acceleration_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();