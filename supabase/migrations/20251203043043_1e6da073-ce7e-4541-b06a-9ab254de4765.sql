
-- Função para contar referrals de um usuário baseado no email da conta
CREATE OR REPLACE FUNCTION public.get_user_referrals_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  referral_code_value TEXT;
  referrals_count INTEGER;
BEGIN
  -- Buscar email do usuário na auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF user_email IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Buscar referral_code do usuário na waitlist
  SELECT referral_code INTO referral_code_value
  FROM waitlist_signups
  WHERE email = user_email
  LIMIT 1;
  
  IF referral_code_value IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Contar quantos signups usaram esse referral_code
  SELECT COUNT(*)::integer INTO referrals_count
  FROM waitlist_signups
  WHERE referred_by = referral_code_value;
  
  RETURN COALESCE(referrals_count, 0);
END;
$$;
