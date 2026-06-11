-- Add linkedin_url and phone columns to project_applications table
ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;