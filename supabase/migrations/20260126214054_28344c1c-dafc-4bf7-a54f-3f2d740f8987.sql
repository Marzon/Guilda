-- Create function to check if user is a STARTER candidate
CREATE OR REPLACE FUNCTION check_starter_candidate(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_candidate BOOLEAN := FALSE;
  v_profile RECORD;
  v_projects_count INTEGER;
  v_already_dismissed BOOLEAN;
BEGIN
  -- Busca perfil
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  -- Se não encontrou perfil, retorna false
  IF v_profile IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Já é STARTER? Não mostrar
  IF v_profile.archetype = 'STARTER' THEN
    RETURN FALSE;
  END IF;
  
  -- Conta projetos criados
  SELECT COUNT(*) INTO v_projects_count 
  FROM projects WHERE owner_id = p_user_id;
  
  -- Verifica se já dispensou o modal (via stats JSONB)
  v_already_dismissed := COALESCE(
    (v_profile.stats->>'starter_suggestion_dismissed')::boolean, 
    FALSE
  );
  
  IF v_already_dismissed THEN
    RETURN FALSE;
  END IF;
  
  -- Critérios de candidato forte:
  -- xp_level = 1, main_skills vazio ou <= 1 skill, nenhum projeto
  v_is_candidate := (
    COALESCE(v_profile.xp_level, 1) = 1 AND
    COALESCE(array_length(v_profile.main_skills, 1), 0) <= 1 AND
    v_projects_count = 0
  );
  
  RETURN v_is_candidate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;