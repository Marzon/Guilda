-- Adicionar campos de origem de cadastro na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signup_source text DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signup_source_other text DEFAULT NULL;

-- Adicionar comentário para documentar valores válidos
COMMENT ON COLUMN public.profiles.signup_source IS 'Origem do cadastro: google, social_media, acceleration, friends, whatsapp, other';