-- Função para logar dados completos antes de deletar permanentemente da lixeira
CREATE OR REPLACE FUNCTION public.log_permanent_deletion()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Salvar dados completos no audit log antes de deletar
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_table,
    target_id,
    old_value,
    new_value
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), -- Admin que está deletando (ou system)
    'PERMANENT_DELETE_FULL_BACKUP',
    'deleted_profiles',
    OLD.id,
    jsonb_build_object(
      'email', OLD.email,
      'username', OLD.username,
      'archetype', OLD.archetype,
      'bio', OLD.bio,
      'stats', OLD.stats,
      'main_skills', OLD.main_skills,
      'xp_level', OLD.xp_level,
      'avatar_url', OLD.avatar_url,
      'looking_for', OLD.looking_for,
      'offering', OLD.offering,
      'phone', OLD.phone,
      'original_created_at', OLD.original_created_at,
      'deleted_at', OLD.deleted_at,
      'deletion_reason', OLD.deletion_reason,
      'deleted_by', OLD.deleted_by,
      'signup_source', OLD.signup_source,
      'signup_source_other', OLD.signup_source_other
    ),
    jsonb_build_object('permanently_deleted_at', now())
  );
  
  RETURN OLD;
END;
$$;

-- Trigger que executa antes de deletar da lixeira
DROP TRIGGER IF EXISTS backup_before_permanent_delete ON public.deleted_profiles;
CREATE TRIGGER backup_before_permanent_delete
BEFORE DELETE ON public.deleted_profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_permanent_deletion();