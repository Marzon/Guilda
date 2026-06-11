-- Backfill email_preferences para todos os usuários que não têm
INSERT INTO public.email_preferences (user_id, match_request, match_accepted, new_message, project_invite, weekly_summary, pending_match_reminder, inactivity_reminder, acceleration_updates)
SELECT 
  p.id as user_id,
  true as match_request,
  true as match_accepted,
  true as new_message,
  true as project_invite,
  true as weekly_summary,
  true as pending_match_reminder,
  true as inactivity_reminder,
  true as acceleration_updates
FROM profiles p
LEFT JOIN email_preferences ep ON ep.user_id = p.id
WHERE ep.id IS NULL;

-- Criar função para auto-criar email_preferences quando perfil é criado
CREATE OR REPLACE FUNCTION public.create_email_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_preferences (
    user_id,
    match_request,
    match_accepted,
    new_message,
    project_invite,
    weekly_summary,
    pending_match_reminder,
    inactivity_reminder,
    acceleration_updates
  ) VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para auto-criar email_preferences
DROP TRIGGER IF EXISTS on_profile_created_create_email_preferences ON public.profiles;
CREATE TRIGGER on_profile_created_create_email_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_email_preferences_for_new_user();

-- Criar função RPC para verificar conversas não lidas
CREATE OR REPLACE FUNCTION public.has_unread_conversations(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_unread BOOLEAN := false;
BEGIN
  -- Verificar mensagens diretas não lidas
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    JOIN messages m ON m.conversation_id = c.id
    WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
      AND m.sender_id != p_user_id
      AND m.is_read = false
      AND (
        (c.participant_1 = p_user_id AND COALESCE(c.is_deleted_by_1, false) = false) OR
        (c.participant_2 = p_user_id AND COALESCE(c.is_deleted_by_2, false) = false)
      )
  ) INTO has_unread;
  
  IF has_unread THEN
    RETURN true;
  END IF;
  
  -- Verificar mensagens de grupo não lidas
  SELECT EXISTS (
    SELECT 1
    FROM group_conversation_members gcm
    JOIN messages m ON m.group_conversation_id = gcm.group_conversation_id
    WHERE gcm.user_id = p_user_id
      AND COALESCE(gcm.is_deleted, false) = false
      AND m.sender_id != p_user_id
      AND m.is_read = false
  ) INTO has_unread;
  
  IF has_unread THEN
    RETURN true;
  END IF;
  
  -- Verificar matches pendentes (onde usuário é target)
  SELECT EXISTS (
    SELECT 1
    FROM matches
    WHERE target_id = p_user_id
      AND status = 'PENDING'
  ) INTO has_unread;
  
  RETURN has_unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;