-- Add equity_offer field to projects table
ALTER TABLE public.projects
ADD COLUMN equity_offer_min integer DEFAULT NULL,
ADD COLUMN equity_offer_max integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.equity_offer_min IS 'Minimum equity percentage offered (0-100)';
COMMENT ON COLUMN public.projects.equity_offer_max IS 'Maximum equity percentage offered (0-100)';

-- Add check constraints
ALTER TABLE public.projects
ADD CONSTRAINT equity_offer_min_range CHECK (equity_offer_min IS NULL OR (equity_offer_min >= 0 AND equity_offer_min <= 100)),
ADD CONSTRAINT equity_offer_max_range CHECK (equity_offer_max IS NULL OR (equity_offer_max >= 0 AND equity_offer_max <= 100)),
ADD CONSTRAINT equity_offer_min_max CHECK (equity_offer_min IS NULL OR equity_offer_max IS NULL OR equity_offer_min <= equity_offer_max);