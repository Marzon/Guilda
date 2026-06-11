-- Fix has_unread_conversations function: was using non-existent is_read column
CREATE OR REPLACE FUNCTION public.has_unread_conversations(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_unread BOOLEAN := false;
BEGIN
  -- Check direct messages with unread status
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    JOIN messages m ON m.conversation_id = c.id
    JOIN profiles p ON p.id = m.sender_id  -- Ensure sender still exists
    WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
      AND m.sender_id != p_user_id
      AND m.read_at IS NULL  -- FIXED: was is_read = false
      AND (
        (c.participant_1 = p_user_id AND COALESCE(c.is_deleted_by_1, false) = false) OR
        (c.participant_2 = p_user_id AND COALESCE(c.is_deleted_by_2, false) = false)
      )
  ) INTO has_unread;
  
  IF has_unread THEN
    RETURN true;
  END IF;
  
  -- Check group messages with unread status
  SELECT EXISTS (
    SELECT 1
    FROM group_conversation_members gcm
    JOIN messages m ON m.group_conversation_id = gcm.conversation_id
    JOIN profiles p ON p.id = m.sender_id  -- Ensure sender still exists
    WHERE gcm.user_id = p_user_id
      AND COALESCE(gcm.is_deleted, false) = false
      AND m.sender_id != p_user_id
      AND m.read_at IS NULL  -- FIXED: was is_read = false
  ) INTO has_unread;
  
  IF has_unread THEN
    RETURN true;
  END IF;
  
  -- Check pending matches
  SELECT EXISTS (
    SELECT 1
    FROM matches
    WHERE target_id = p_user_id
      AND status = 'PENDING'
  ) INTO has_unread;
  
  RETURN has_unread;
END;
$$;

-- Fix count_unread_messages function: add profile existence check
CREATE OR REPLACE FUNCTION public.count_unread_messages(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT c.id) INTO unread_count
  FROM conversations c
  JOIN messages m ON m.conversation_id = c.id
  JOIN profiles p ON p.id = m.sender_id  -- Ensure sender still exists
  WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
    AND m.sender_id != p_user_id
    AND m.read_at IS NULL
    AND NOT (
      (c.participant_1 = p_user_id AND COALESCE(c.is_deleted_by_1, true) = true)
      OR 
      (c.participant_2 = p_user_id AND COALESCE(c.is_deleted_by_2, true) = true)
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$;