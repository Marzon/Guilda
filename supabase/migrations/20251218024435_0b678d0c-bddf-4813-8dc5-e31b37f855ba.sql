-- Fase 1: Remover features de impacto zero (ordem corrigida)

-- 1. Drop tables first (CASCADE will remove dependent policies)
DROP TABLE IF EXISTS public.blocked_users CASCADE;
DROP TABLE IF EXISTS public.email_leads CASCADE;
DROP TABLE IF EXISTS public.profile_boosts CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.comment_likes CASCADE;

-- 2. Now drop functions (after tables are gone)
DROP FUNCTION IF EXISTS public.is_blocked(uuid, uuid);
DROP FUNCTION IF EXISTS public.check_email_leads_rate_limit(text);
DROP FUNCTION IF EXISTS public.is_user_boosted(uuid);

-- 3. Update get_or_create_conversation to remove blocked check
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  conv_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM conversations
  WHERE (participant_1 = current_user_id AND participant_2 = other_user_id)
     OR (participant_1 = other_user_id AND participant_2 = current_user_id)
  LIMIT 1;

  -- If not found, create new conversation
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (current_user_id, other_user_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$function$;

-- 4. Update get_subscription_info to remove boost fields
CREATE OR REPLACE FUNCTION public.get_subscription_info(p_user_id uuid)
 RETURNS TABLE(tier subscription_tier, is_premium boolean, daily_matches_remaining integer, is_boosted boolean, boost_expires_at timestamp with time zone, monthly_messages_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier subscription_tier;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_matches_sent INTEGER;
  v_messages_sent INTEGER;
BEGIN
  SELECT s.tier, s.expires_at INTO v_tier, v_expires_at 
  FROM subscriptions s WHERE s.user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    INSERT INTO subscriptions (user_id, tier) VALUES (p_user_id, 'FREE')
    ON CONFLICT (user_id) DO NOTHING;
    v_tier := 'FREE';
  END IF;
  
  IF v_tier = 'ADVENTURER' AND v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    UPDATE subscriptions SET tier = 'FREE', expires_at = NULL WHERE user_id = p_user_id;
    v_tier := 'FREE';
  END IF;
  
  SELECT dl.matches_sent INTO v_matches_sent 
  FROM daily_limits dl 
  WHERE dl.user_id = p_user_id AND dl.reset_date = CURRENT_DATE;
  
  IF v_matches_sent IS NULL THEN
    v_matches_sent := 0;
  END IF;
  
  SELECT mml.messages_sent INTO v_messages_sent 
  FROM monthly_message_limits mml 
  WHERE mml.user_id = p_user_id 
    AND mml.reset_month = date_trunc('month', CURRENT_DATE)::date;
  
  IF v_messages_sent IS NULL THEN
    v_messages_sent := 0;
  END IF;
  
  RETURN QUERY SELECT
    v_tier,
    v_tier IN ('FOUNDER', 'ADVENTURER'),
    CASE 
      WHEN v_tier = 'FOUNDER' THEN 999999
      WHEN v_tier = 'ADVENTURER' THEN GREATEST(0, 10 - v_matches_sent)
      ELSE GREATEST(0, 1 - v_matches_sent)
    END,
    false,
    NULL::timestamp with time zone,
    CASE 
      WHEN v_tier IN ('FOUNDER', 'ADVENTURER') THEN 999999
      ELSE GREATEST(0, 100 - v_messages_sent)
    END;
END;
$function$;

-- 5. Update get_batch_subscription_info to remove boost fields
CREATE OR REPLACE FUNCTION public.get_batch_subscription_info(user_ids uuid[])
 RETURNS TABLE(user_id uuid, tier subscription_tier, is_premium boolean, daily_matches_remaining integer, is_boosted boolean, boost_expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_subs AS (
    SELECT 
      u.id,
      COALESCE(s.tier, 'FREE'::subscription_tier) as tier,
      s.expires_at,
      CASE 
        WHEN s.tier = 'ADVENTURER' AND s.expires_at IS NOT NULL AND s.expires_at < now() THEN 'FREE'::subscription_tier
        ELSE COALESCE(s.tier, 'FREE'::subscription_tier)
      END as effective_tier
    FROM unnest(user_ids) u(id)
    LEFT JOIN subscriptions s ON s.user_id = u.id
  ),
  user_limits AS (
    SELECT 
      u.id,
      COALESCE(dl.matches_sent, 0) as matches_sent
    FROM unnest(user_ids) u(id)
    LEFT JOIN daily_limits dl ON dl.user_id = u.id AND dl.reset_date = CURRENT_DATE
  )
  SELECT
    us.id,
    us.effective_tier,
    us.effective_tier IN ('FOUNDER', 'ADVENTURER'),
    CASE 
      WHEN us.effective_tier = 'FOUNDER' THEN 999999 
      WHEN us.effective_tier = 'ADVENTURER' THEN GREATEST(0, 10 - ul.matches_sent)
      ELSE GREATEST(0, 1 - ul.matches_sent)
    END as daily_matches_remaining,
    false as is_boosted,
    NULL::timestamp with time zone as boost_expires_at
  FROM user_subs us
  LEFT JOIN user_limits ul ON ul.id = us.id;
END;
$function$;