-- Add max_slots column to cohorts table for controlling enrollment capacity
-- This will split 50/50 between builders and sellers
ALTER TABLE public.cohorts 
ADD COLUMN max_slots integer DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.cohorts.max_slots IS 'Total number of slots in the cohort. Split 50/50 between builders and sellers. NULL means unlimited.';

-- Create function to get cohort slot counts by archetype
CREATE OR REPLACE FUNCTION public.get_cohort_slot_counts(p_cohort_id uuid)
RETURNS TABLE(
  builders_count integer,
  sellers_count integer,
  total_count integer,
  max_builders integer,
  max_sellers integer,
  max_total integer
) AS $$
DECLARE
  v_max_slots integer;
BEGIN
  -- Get max slots for the cohort
  SELECT c.max_slots INTO v_max_slots
  FROM cohorts c
  WHERE c.id = p_cohort_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN p.archetype = 'BUILDER' THEN 1 ELSE 0 END)::integer, 0) as builders_count,
    COALESCE(SUM(CASE WHEN p.archetype = 'SELLER' THEN 1 ELSE 0 END)::integer, 0) as sellers_count,
    COUNT(*)::integer as total_count,
    CASE WHEN v_max_slots IS NOT NULL THEN (v_max_slots / 2)::integer ELSE NULL END as max_builders,
    CASE WHEN v_max_slots IS NOT NULL THEN (v_max_slots / 2)::integer ELSE NULL END as max_sellers,
    v_max_slots as max_total
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  WHERE s.cohort_id = p_cohort_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check if user can be enrolled in a cohort
-- Returns true/false and a reason message
CREATE OR REPLACE FUNCTION public.can_enroll_in_cohort(
  p_user_id uuid,
  p_cohort_id uuid
)
RETURNS TABLE(
  can_enroll boolean,
  reason text
) AS $$
DECLARE
  v_archetype text;
  v_bio text;
  v_main_skills text[];
  v_tier text;
  v_max_slots integer;
  v_current_builders integer;
  v_current_sellers integer;
  v_max_per_archetype integer;
BEGIN
  -- Get user profile data
  SELECT p.archetype, p.bio, p.main_skills
  INTO v_archetype, v_bio, v_main_skills
  FROM profiles p
  WHERE p.id = p_user_id;
  
  -- Check if profile exists
  IF v_archetype IS NULL THEN
    RETURN QUERY SELECT false, 'Usuário não encontrado';
    RETURN;
  END IF;
  
  -- Check if user has bio
  IF v_bio IS NULL OR TRIM(v_bio) = '' THEN
    RETURN QUERY SELECT false, 'Perfil incompleto: bio não preenchida';
    RETURN;
  END IF;
  
  -- Check if user has skills
  IF v_main_skills IS NULL OR array_length(v_main_skills, 1) IS NULL OR array_length(v_main_skills, 1) = 0 THEN
    RETURN QUERY SELECT false, 'Perfil incompleto: skills não definidas';
    RETURN;
  END IF;
  
  -- Check if user is a founder (has FOUNDER or ALPHA tier subscription OR approved social payment)
  SELECT s.tier INTO v_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id;
  
  IF v_tier IS NULL OR (v_tier != 'FOUNDER' AND v_tier != 'ALPHA') THEN
    -- Check social payment as alternative
    DECLARE
      v_has_social_payment boolean;
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM social_payment_submissions sps
        WHERE sps.user_id = p_user_id AND sps.status = 'approved'
      ) INTO v_has_social_payment;
      
      IF NOT v_has_social_payment THEN
        RETURN QUERY SELECT false, 'Apenas founders podem participar (pagamento social necessário)';
        RETURN;
      END IF;
    END;
  END IF;
  
  -- Check cohort slot limits
  SELECT c.max_slots INTO v_max_slots
  FROM cohorts c
  WHERE c.id = p_cohort_id;
  
  -- If no slot limit, allow enrollment
  IF v_max_slots IS NULL THEN
    RETURN QUERY SELECT true, 'OK';
    RETURN;
  END IF;
  
  -- Calculate max per archetype (50/50 split)
  v_max_per_archetype := v_max_slots / 2;
  
  -- Get current counts
  SELECT 
    COALESCE(SUM(CASE WHEN p.archetype = 'BUILDER' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.archetype = 'SELLER' THEN 1 ELSE 0 END), 0)
  INTO v_current_builders, v_current_sellers
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  WHERE s.cohort_id = p_cohort_id;
  
  -- Check if there's room for this archetype
  IF v_archetype = 'BUILDER' AND v_current_builders >= v_max_per_archetype THEN
    RETURN QUERY SELECT false, 'Vagas para builders esgotadas nesta turma';
    RETURN;
  END IF;
  
  IF v_archetype = 'SELLER' AND v_current_sellers >= v_max_per_archetype THEN
    RETURN QUERY SELECT false, 'Vagas para sellers esgotadas nesta turma';
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT true, 'OK';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;