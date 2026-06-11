-- Update the handle_showcase_request trigger to include approval link in messages
CREATE OR REPLACE FUNCTION handle_showcase_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';
  project_title TEXT;
  project_owner_id UUID;
  requester_username TEXT;
  conv_id UUID;
  target_user_id UUID;
  message_sender_id UUID;
BEGIN
  -- Get project info
  SELECT title, owner_id INTO project_title, project_owner_id 
  FROM projects WHERE id = NEW.project_id;
  
  SELECT username INTO requester_username FROM profiles WHERE id = NEW.requester_id;

  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    
    IF NEW.request_type = 'admin_suggestion' THEN
      target_user_id := project_owner_id;
      message_sender_id := admin_user_id;
      
      SELECT id INTO conv_id FROM conversations 
      WHERE (participant_1 = admin_user_id AND participant_2 = project_owner_id)
         OR (participant_1 = project_owner_id AND participant_2 = admin_user_id)
      LIMIT 1;
      
      IF conv_id IS NULL THEN
        INSERT INTO conversations (participant_1, participant_2, last_message_at)
        VALUES (admin_user_id, project_owner_id, now())
        RETURNING id INTO conv_id;
      END IF;
      
      -- Mensagem do admin para o owner COM LINK DE APROVAÇÃO
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (conv_id, admin_user_id, 
        '📢 **Sugestão de Publicação no Discovery**

🚀 Projeto: **' || project_title || '**

Gostaríamos de publicar seu projeto na página Discovery para dar mais visibilidade!

👉 Clique aqui para revisar: https://guilda.app.br/project/' || NEW.project_id || '/settings?showcase_action=review&tab=settings');
        
    ELSE
      target_user_id := admin_user_id;
      message_sender_id := NEW.requester_id;
      
      SELECT id INTO conv_id FROM conversations 
      WHERE (participant_1 = admin_user_id AND participant_2 = NEW.requester_id)
         OR (participant_1 = NEW.requester_id AND participant_2 = admin_user_id)
      LIMIT 1;
      
      IF conv_id IS NULL THEN
        INSERT INTO conversations (participant_1, participant_2, last_message_at)
        VALUES (admin_user_id, NEW.requester_id, now())
        RETURNING id INTO conv_id;
      END IF;
      
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (conv_id, NEW.requester_id, 
        '📢 **Solicitação de Publicação Pública**

🚀 Projeto: **' || project_title || '**

Gostaria de publicar meu projeto na página Discovery para atrair mais co-fundadores.

Por favor, revise e aprove se estiver tudo certo!');
    END IF;
    
    UPDATE conversations SET last_message_at = now() WHERE id = conv_id;
    
    INSERT INTO project_updates (project_id, author_id, content, type)
    VALUES (NEW.project_id, NEW.requester_id, 
      CASE WHEN NEW.request_type = 'admin_suggestion' 
        THEN 'Admin sugeriu publicação no Discovery' 
        ELSE 'Publicação pública solicitada' 
      END, 
      'SHOWCASE_REQUESTED');
      
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update existing pending admin_suggestion messages to include the approval link
-- Using a subquery approach to avoid the FROM-clause issue
UPDATE messages
SET content = subq.new_content
FROM (
  SELECT 
    m.id as message_id,
    '📢 **Sugestão de Publicação no Discovery**

🚀 Projeto: **' || p.title || '**

Gostaríamos de publicar seu projeto na página Discovery para dar mais visibilidade!

👉 Clique aqui para revisar: https://guilda.app.br/project/' || sr.project_id || '/settings?showcase_action=review&tab=settings' as new_content
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  JOIN showcase_requests sr ON sr.status = 'pending' AND sr.request_type = 'admin_suggestion'
  JOIN projects p ON p.id = sr.project_id
  WHERE m.content LIKE '%Sugestão de Publicação no Discovery%'
    AND m.content LIKE '%' || p.title || '%'
    AND m.sender_id = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'
    AND (
      (c.participant_1 = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e' AND c.participant_2 = p.owner_id)
      OR (c.participant_2 = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e' AND c.participant_1 = p.owner_id)
    )
) subq
WHERE messages.id = subq.message_id;