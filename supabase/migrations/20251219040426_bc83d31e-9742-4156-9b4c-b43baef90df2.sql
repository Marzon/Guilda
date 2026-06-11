-- Data fix: Resend showcase suggestion messages to correct recipients
-- and remove self-suggestions (where admin is the project owner)

DO $$
DECLARE
  admin_user_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';
  r RECORD;
  conv_id UUID;
BEGIN
  -- Delete self-suggestions (admin suggesting to their own projects)
  DELETE FROM showcase_requests sr
  WHERE sr.request_type = 'admin_suggestion'
    AND sr.status = 'pending'
    AND EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = sr.project_id 
      AND p.owner_id = admin_user_id
    );
  
  RAISE NOTICE 'Deleted self-suggestions where admin is project owner';

  -- Loop through valid pending admin_suggestion requests
  FOR r IN 
    SELECT 
      sr.id as request_id,
      sr.project_id,
      p.title as project_title,
      p.owner_id as project_owner_id
    FROM showcase_requests sr
    JOIN projects p ON p.id = sr.project_id
    WHERE sr.request_type = 'admin_suggestion'
      AND sr.status = 'pending'
      AND p.owner_id != admin_user_id
  LOOP
    -- Find existing conversation between admin and project owner
    SELECT id INTO conv_id 
    FROM conversations 
    WHERE (participant_1 = admin_user_id AND participant_2 = r.project_owner_id)
       OR (participant_1 = r.project_owner_id AND participant_2 = admin_user_id)
    LIMIT 1;
    
    -- Create conversation if not exists
    IF conv_id IS NULL THEN
      INSERT INTO conversations (participant_1, participant_2, last_message_at)
      VALUES (admin_user_id, r.project_owner_id, now())
      RETURNING id INTO conv_id;
      
      RAISE NOTICE 'Created new conversation for project owner %', r.project_owner_id;
    END IF;
    
    -- Insert the correct message from admin to owner
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (
      conv_id, 
      admin_user_id, 
      '📢 **Sugestão de Publicação no Discovery**

🚀 Projeto: **' || r.project_title || '**

Gostaríamos de publicar seu projeto na página Discovery para dar mais visibilidade!

Você pode aprovar ou recusar nas configurações do projeto.'
    );
    
    -- Update conversation last_message_at
    UPDATE conversations SET last_message_at = now() WHERE id = conv_id;
    
    RAISE NOTICE 'Sent message for project: %', r.project_title;
  END LOOP;
  
  RAISE NOTICE 'Done! Messages sent to correct project owners.';
END $$;