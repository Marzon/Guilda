-- Add auto_accept_matches column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auto_accept_matches boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.auto_accept_matches IS 
'Se true, conexões pendentes serão aceitas automaticamente após 72h sem resposta';