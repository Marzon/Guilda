-- Add Do Not Disturb column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dnd_until TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.profiles.dnd_until IS 'Data/hora até quando o modo não perturbe está ativo. NULL = desativado';