-- Atualizar função can_enroll_in_cohort para bypass completo quando admin
CREATE OR REPLACE FUNCTION public.can_enroll_in_cohort(
  p_user_id uuid, 
  p_cohort_id uuid,
  p_admin_override boolean DEFAULT false
)
RETURNS TABLE(can_enroll boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cohort_status text;
  v_max_slots integer;
  v_current_members integer;
  v_already_enrolled boolean;
  v_tier text;
  v_has_social_payment boolean;
  v_bio text;
  v_main_skills text[];
BEGIN
  -- Check if cohort exists
  SELECT c.status, c.max_slots 
  INTO v_cohort_status, v_max_slots
  FROM cohorts c 
  WHERE c.id = p_cohort_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Cohort não encontrado';
    RETURN;
  END IF;
  
  -- Skip status check if admin override
  IF NOT p_admin_override THEN
    IF v_cohort_status != 'active' AND v_cohort_status != 'upcoming' THEN
      RETURN QUERY SELECT false, 'Cohort não está aceitando inscrições';
      RETURN;
    END IF;
  END IF;
  
  -- Check if user is already enrolled
  SELECT EXISTS(
    SELECT 1 FROM acceleration_user_progress 
    WHERE user_id = p_user_id AND cohort_id = p_cohort_id
  ) INTO v_already_enrolled;
  
  IF v_already_enrolled THEN
    RETURN QUERY SELECT false, 'Você já está inscrito neste cohort';
    RETURN;
  END IF;
  
  -- Get user profile info
  SELECT p.bio, p.main_skills
  INTO v_bio, v_main_skills
  FROM profiles p
  WHERE p.id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Perfil não encontrado';
    RETURN;
  END IF;
  
  -- Skip profile checks if admin override
  IF NOT p_admin_override THEN
    -- Check bio
    IF v_bio IS NULL OR TRIM(v_bio) = '' THEN
      RETURN QUERY SELECT false, 'Perfil incompleto: bio não preenchida';
      RETURN;
    END IF;
    
    -- Check skills
    IF v_main_skills IS NULL OR array_length(v_main_skills, 1) IS NULL THEN
      RETURN QUERY SELECT false, 'Perfil incompleto: skills não definidas';
      RETURN;
    END IF;
  END IF;
  
  -- Get subscription info
  SELECT tier INTO v_tier
  FROM get_subscription_info(p_user_id);
  
  -- Check if user has approved social payment
  SELECT EXISTS(
    SELECT 1 FROM payment_receipts 
    WHERE user_id = p_user_id 
    AND product_type = 'social_payment'
    AND status = 'approved'
  ) INTO v_has_social_payment;
  
  -- Skip tier check if admin override
  IF NOT p_admin_override THEN
    -- Check tier requirement
    IF v_tier NOT IN ('FOUNDER', 'ALPHA') AND NOT v_has_social_payment THEN
      RETURN QUERY SELECT false, 'Requer assinatura FOUNDER ou pagamento social aprovado';
      RETURN;
    END IF;
  END IF;
  
  -- Check slot availability (always check this, even with admin override)
  IF v_max_slots IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_members
    FROM acceleration_user_progress
    WHERE cohort_id = p_cohort_id;
    
    IF v_current_members >= v_max_slots THEN
      RETURN QUERY SELECT false, 'Cohort está lotado';
      RETURN;
    END IF;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT true, 'OK';
END;
$function$;