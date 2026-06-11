-- Add investor type (Angel, Seed, Series A, etc)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS investor_type text;

-- Add investor sectors of interest (array of strings)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS investor_sectors text[];

-- Add investor check range
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS investor_check_range text;