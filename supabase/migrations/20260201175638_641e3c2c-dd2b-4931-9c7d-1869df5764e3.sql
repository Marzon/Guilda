-- Add is_pilot column to cohorts table to identify pilot batches
ALTER TABLE public.cohorts 
ADD COLUMN is_pilot BOOLEAN NOT NULL DEFAULT false;

-- Mark Batch #01 as pilot (it didn't run the actual program)
UPDATE public.cohorts 
SET is_pilot = true 
WHERE id = '68a12132-cd0f-4e4e-8207-2e7c7fd550b7';