-- Function to send project welcome message
CREATE OR REPLACE FUNCTION public.send_project_welcome_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';
  existing_conversation_id UUID;
  new_conversation_id UUID;
  project_welcome_message TEXT;
BEGIN
  -- Don't send message to admin themselves or for showcase projects
  IF NEW.owner_id = admin_user_id OR NEW.is_showcase = true THEN
    RETURN NEW;
  END IF;

  -- Create welcome message content
  project_welcome_message := 'Olá, como vai? Muito legal ver que você já tem um projeto! Gostaria de encorajar você a navegar pela Taverna e buscar se engajar com alguém!

Abraços 🚀';

  -- Check if conversation already exists
  SELECT id INTO existing_conversation_id
  FROM conversations
  WHERE (participant_1 = admin_user_id AND participant_2 = NEW.owner_id)
     OR (participant_1 = NEW.owner_id AND participant_2 = admin_user_id)
  LIMIT 1;

  -- Use existing conversation or create new one
  IF existing_conversation_id IS NOT NULL THEN
    new_conversation_id := existing_conversation_id;
    
    -- Update last_message_at
    UPDATE conversations
    SET last_message_at = now()
    WHERE id = new_conversation_id;
  ELSE
    -- Create new conversation
    INSERT INTO conversations (participant_1, participant_2, last_message_at)
    VALUES (admin_user_id, NEW.owner_id, now())
    RETURNING id INTO new_conversation_id;
  END IF;

  -- Insert project welcome message
  INSERT INTO messages (conversation_id, sender_id, content, created_at)
  VALUES (new_conversation_id, admin_user_id, project_welcome_message, now());

  RETURN NEW;
END;
$function$;

-- Create trigger for new projects
DROP TRIGGER IF EXISTS on_project_created_send_welcome ON projects;
CREATE TRIGGER on_project_created_send_welcome
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION send_project_welcome_message();