-- Add checklist_progress column to acceleration_teams table
ALTER TABLE public.acceleration_teams 
ADD COLUMN IF NOT EXISTS checklist_progress text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.acceleration_teams.checklist_progress IS 'Array of completed checklist item IDs for founder manual';