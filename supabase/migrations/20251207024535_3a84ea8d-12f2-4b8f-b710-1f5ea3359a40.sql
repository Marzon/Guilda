-- 1. Criar tabela de limites mensais de mensagens
CREATE TABLE IF NOT EXISTS public.monthly_message_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  reset_month DATE DEFAULT date_trunc('month', CURRENT_DATE)::date,
  UNIQUE(user_id, reset_month)
);

-- 2. Habilitar RLS
ALTER TABLE public.monthly_message_limits ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
CREATE POLICY "Users can view their own message limits" ON public.monthly_message_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message limits" ON public.monthly_message_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message limits" ON public.monthly_message_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Função para incrementar contador mensal
CREATE OR REPLACE FUNCTION public.increment_monthly_messages(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO monthly_message_limits (user_id, messages_sent, reset_month)
  VALUES (p_user_id, 1, date_trunc('month', CURRENT_DATE)::date)
  ON CONFLICT (user_id, reset_month) 
  DO UPDATE SET messages_sent = monthly_message_limits.messages_sent + 1;
END;
$$;

-- 5. Atualizar get_subscription_info para incluir mensagens mensais
DROP FUNCTION IF EXISTS public.get_subscription_info(uuid);

CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
RETURNS TABLE(
  tier subscription_tier, 
  is_premium boolean, 
  daily_matches_remaining integer, 
  is_boosted boolean, 
  boost_expires_at timestamp with time zone,
  monthly_messages_remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier subscription_tier;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_matches_sent INTEGER;
  v_messages_sent INTEGER;
  v_boost_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get subscription info including expires_at
  SELECT s.tier, s.expires_at INTO v_tier, v_expires_at 
  FROM subscriptions s WHERE s.user_id = p_user_id;
  
  -- If no subscription, create FREE subscription
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  -- Check if ADVENTURER subscription has expired
  IF v_tier = 'ADVENTURER' AND v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    UPDATE subscriptions SET tier = 'FREE', expires_at = NULL WHERE user_id = p_user_id;
    v_tier := 'FREE';
  END IF;
  
  -- Get daily matches sent
  SELECT dl.matches_sent INTO v_matches_sent 
  FROM daily_limits dl 
  WHERE dl.user_id = p_user_id AND dl.reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;
  
  -- Get monthly messages sent
  SELECT mml.messages_sent INTO v_messages_sent 
  FROM monthly_message_limits mml 
  WHERE mml.user_id = p_user_id 
    AND mml.reset_month = date_trunc('month', CURRENT_DATE)::date;
  
  IF v_messages_sent IS NULL THEN
    v_messages_sent := 0;
  END IF;
  
  -- Get active boost
  SELECT pb.expires_at INTO v_boost_expires
  FROM profile_boosts pb
  WHERE pb.user_id = p_user_id AND pb.expires_at > now()
  ORDER BY pb.expires_at DESC
  LIMIT 1;
  
  RETURN QUERY SELECT
    v_tier,
    v_tier IN ('FOUNDER', 'ADVENTURER'),
    CASE 
      WHEN v_tier = 'FOUNDER' THEN 999999
      WHEN v_tier = 'ADVENTURER' THEN GREATEST(0, 10 - v_matches_sent)
      ELSE GREATEST(0, 1 - v_matches_sent)
    END,
    v_boost_expires IS NOT NULL,
    v_boost_expires,
    CASE 
      WHEN v_tier IN ('FOUNDER', 'ADVENTURER') THEN 999999
      ELSE GREATEST(0, 100 - v_messages_sent)
    END;
END;
$$;