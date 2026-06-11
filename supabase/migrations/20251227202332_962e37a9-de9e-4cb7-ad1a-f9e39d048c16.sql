-- Tabela para armazenar perfis deletados (lixeira)
CREATE TABLE public.deleted_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  archetype archetype NOT NULL,
  bio TEXT,
  main_skills TEXT[],
  stats JSONB,
  xp_level INTEGER,
  avatar_url TEXT,
  looking_for TEXT,
  offering TEXT,
  signup_source TEXT,
  signup_source_other TEXT,
  phone TEXT,
  original_created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by UUID,
  deletion_reason TEXT
);

-- Enable RLS
ALTER TABLE public.deleted_profiles ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver e gerenciar perfis deletados
CREATE POLICY "Admins can view deleted profiles"
ON public.deleted_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage deleted profiles"
ON public.deleted_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role pode gerenciar para edge functions
CREATE POLICY "Service role can manage deleted profiles"
ON public.deleted_profiles
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Função para mover perfil para lixeira antes de deletar
CREATE OR REPLACE FUNCTION public.archive_deleted_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Buscar email do usuário em auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = OLD.id;
  
  -- Se não encontrar email (usuário já deletado de auth), usar placeholder
  IF user_email IS NULL THEN
    user_email := 'deleted-' || OLD.id::TEXT || '@unknown.com';
  END IF;
  
  -- Inserir na lixeira (ou atualizar se já existir)
  INSERT INTO public.deleted_profiles (
    id, email, username, archetype, bio, main_skills, stats,
    xp_level, avatar_url, looking_for, offering, signup_source,
    signup_source_other, phone, original_created_at, deleted_at
  ) VALUES (
    OLD.id, user_email, OLD.username, OLD.archetype, OLD.bio, 
    OLD.main_skills, OLD.stats, OLD.xp_level, OLD.avatar_url,
    OLD.looking_for, OLD.offering, OLD.signup_source,
    OLD.signup_source_other, OLD.phone, OLD.created_at, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    archetype = EXCLUDED.archetype,
    bio = EXCLUDED.bio,
    main_skills = EXCLUDED.main_skills,
    stats = EXCLUDED.stats,
    xp_level = EXCLUDED.xp_level,
    avatar_url = EXCLUDED.avatar_url,
    looking_for = EXCLUDED.looking_for,
    offering = EXCLUDED.offering,
    signup_source = EXCLUDED.signup_source,
    signup_source_other = EXCLUDED.signup_source_other,
    phone = EXCLUDED.phone,
    original_created_at = EXCLUDED.original_created_at,
    deleted_at = now();
  
  RETURN OLD;
END;
$$;

-- Trigger para arquivar perfil antes de deletar
CREATE TRIGGER archive_profile_before_delete
BEFORE DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.archive_deleted_profile();

-- Modificar a função handle_new_user para bloquear usuários deletados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_record RECORD;
BEGIN
  -- Verificar se o email está na lixeira de perfis deletados
  SELECT id, email INTO deleted_record
  FROM public.deleted_profiles
  WHERE email = NEW.email
  LIMIT 1;
  
  -- Se o email está na lixeira, NÃO criar perfil automaticamente
  IF deleted_record.id IS NOT NULL THEN
    -- Não criar perfil - usuário precisará ser reativado pelo admin
    RETURN NEW;
  END IF;
  
  -- Email não está na lixeira, criar perfil normalmente
  INSERT INTO public.profiles (id, username, archetype, stats)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    ),
    'BUILDER',
    '{"execution": 50, "network": 50, "creativity": 50, "strategy": 50}'::jsonb
  );
  
  RETURN NEW;
END;
$$;

-- Função para verificar se usuário está na lixeira (para uso no frontend)
CREATE OR REPLACE FUNCTION public.check_deleted_user(user_email TEXT)
RETURNS TABLE(is_deleted BOOLEAN, deleted_at TIMESTAMPTZ, username TEXT)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as is_deleted,
    dp.deleted_at,
    dp.username
  FROM public.deleted_profiles dp
  WHERE dp.email = user_email
  LIMIT 1;
  
  -- Se não encontrar, retornar que não está deletado
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, NULL::TIMESTAMPTZ, NULL::TEXT;
  END IF;
END;
$$;

-- Função para reativar perfil (apenas admin via edge function)
CREATE OR REPLACE FUNCTION public.reactivate_profile(profile_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_record RECORD;
BEGIN
  -- Buscar dados do perfil deletado
  SELECT * INTO deleted_record
  FROM public.deleted_profiles
  WHERE id = profile_id;
  
  IF deleted_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Inserir de volta na tabela profiles
  INSERT INTO public.profiles (
    id, username, archetype, bio, main_skills, stats,
    xp_level, avatar_url, looking_for, offering, signup_source,
    signup_source_other, phone, created_at
  ) VALUES (
    deleted_record.id, deleted_record.username, deleted_record.archetype,
    deleted_record.bio, deleted_record.main_skills, deleted_record.stats,
    deleted_record.xp_level, deleted_record.avatar_url, deleted_record.looking_for,
    deleted_record.offering, deleted_record.signup_source, deleted_record.signup_source_other,
    deleted_record.phone, deleted_record.original_created_at
  );
  
  -- Remover da lixeira
  DELETE FROM public.deleted_profiles WHERE id = profile_id;
  
  RETURN TRUE;
END;
$$;