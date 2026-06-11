-- Add memorandum column to acceleration_teams for storing the "who does what" agreement
ALTER TABLE public.acceleration_teams 
ADD COLUMN IF NOT EXISTS memorandum TEXT;