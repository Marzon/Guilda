-- Fix the handle_showcase_request trigger to correctly route messages
-- For admin_suggestion: admin sends to project owner
-- For owner_request: owner sends to admin

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
      -- Admin sugere ao owner: conversa admin ↔ project_owner
      -- Admin é o sender, owner é o target
      target_user_id := project_owner_id;
      message_sender_id := admin_user_id;
      
      -- Find or create conversation between admin and project owner
      SELECT id INTO conv_id FROM conversations 
      WHERE (participant_1 = admin_user_id AND participant_2 = project_owner_id)
         OR (participant_1 = project_owner_id AND participant_2 = admin_user_id)
      LIMIT 1;
      
      IF conv_id IS NULL THEN
        INSERT INTO conversations (participant_1, participant_2, last_message_at)
        VALUES (admin_user_id, project_owner_id, now())
        RETURNING id INTO conv_id;
      END IF;
      
      -- Mensagem do admin para o owner
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (conv_id, admin_user_id, 
        '📢 **Sugestão de Publicação no Discovery**

🚀 Projeto: **' || project_title || '**

Gostaríamos de publicar seu projeto na página Discovery para dar mais visibilidade!

Você pode aprovar ou recusar nas configurações do projeto.');
        
    ELSE
      -- Owner pede ao admin: conversa owner ↔ admin (fluxo original)
      target_user_id := admin_user_id;
      message_sender_id := NEW.requester_id;
      
      -- Find or create conversation between requester and admin
      SELECT id INTO conv_id FROM conversations 
      WHERE (participant_1 = admin_user_id AND participant_2 = NEW.requester_id)
         OR (participant_1 = NEW.requester_id AND participant_2 = admin_user_id)
      LIMIT 1;
      
      IF conv_id IS NULL THEN
        INSERT INTO conversations (participant_1, participant_2, last_message_at)
        VALUES (admin_user_id, NEW.requester_id, now())
        RETURNING id INTO conv_id;
      END IF;
      
      -- Mensagem do owner para o admin
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (conv_id, NEW.requester_id, 
        '📢 **Solicitação de Publicação Pública**

🚀 Projeto: **' || project_title || '**

Gostaria de publicar meu projeto na página Discovery para atrair mais co-fundadores.

Por favor, revise e aprove se estiver tudo certo!');
    END IF;
    
    UPDATE conversations SET last_message_at = now() WHERE id = conv_id;
    
    -- Timeline entry
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