-- Add column to track when team introductions were sent
ALTER TABLE public.acceleration_teams 
ADD COLUMN IF NOT EXISTS introductions_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_acceleration_teams_introductions 
ON public.acceleration_teams (cohort_id, introductions_sent_at) 
WHERE introductions_sent_at IS NULL;