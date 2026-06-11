-- Add seeking capital fields to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS seeking_capital boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS capital_amount_sought numeric DEFAULT NULL;

COMMENT ON COLUMN public.projects.seeking_capital IS 'Whether the project is actively seeking capital investment';
COMMENT ON COLUMN public.projects.capital_amount_sought IS 'Amount of capital being sought in BRL';