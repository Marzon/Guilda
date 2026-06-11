CREATE OR REPLACE FUNCTION public.count_unread_messages(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  -- Count conversations with unread messages (messages from other users that haven't been read)
  SELECT COUNT(DISTINCT c.id) INTO unread_count
  FROM conversations c
  JOIN messages m ON m.conversation_id = c.id
  WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
    AND m.sender_id != p_user_id
    AND m.read_at IS NULL;
  
  RETURN COALESCE(unread_count, 0);
END;
$$;