-- Update count_unread_messages function to ignore soft-deleted conversations
CREATE OR REPLACE FUNCTION public.count_unread_messages(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT c.id) INTO unread_count
  FROM conversations c
  JOIN messages m ON m.conversation_id = c.id
  WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
    AND m.sender_id != p_user_id
    AND m.read_at IS NULL
    -- Ignore soft-deleted conversations for this user
    AND NOT (
      (c.participant_1 = p_user_id AND c.is_deleted_by_1 = true)
      OR 
      (c.participant_2 = p_user_id AND c.is_deleted_by_2 = true)
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$;