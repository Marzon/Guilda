-- Fix: Prevent users from creating conversations with themselves
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
  -- Prevent creating conversation with yourself
  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create a conversation with yourself';
  END IF;

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

-- Add a constraint to prevent self-conversations at database level
ALTER TABLE conversations 
ADD CONSTRAINT no_self_conversations 
CHECK (participant_1 != participant_2);