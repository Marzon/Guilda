-- First remove old constraint
ALTER TABLE public.cohorts DROP CONSTRAINT IF EXISTS cohorts_status_check;

-- Update existing CLOSED status to PLANNED before adding new constraint
UPDATE public.cohorts SET status = 'PLANNED' WHERE status = 'CLOSED';

-- Now add new constraint with more status options
ALTER TABLE public.cohorts ADD CONSTRAINT cohorts_status_check 
  CHECK (status IN ('PLANNED', 'OPEN', 'IN_PROGRESS', 'COMPLETED'));