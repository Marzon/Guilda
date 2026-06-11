-- Create showcase_requests table
CREATE TABLE public.showcase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Create unique partial index for only one pending request per project
CREATE UNIQUE INDEX idx_showcase_requests_pending 
ON showcase_requests (project_id) 
WHERE status = 'pending';

-- Enable RLS
ALTER TABLE showcase_requests ENABLE ROW LEVEL SECURITY;

-- Owners can view their own requests
CREATE POLICY "Owners can view own showcase requests"
ON showcase_requests FOR SELECT USING (
  requester_id = auth.uid() OR 
  has_role(auth.uid(), 'admin')
);

-- Owners can create requests for their projects
CREATE POLICY "Owners can create showcase requests"
ON showcase_requests FOR INSERT WITH CHECK (
  requester_id = auth.uid() AND
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
);

-- Only admins can update requests
CREATE POLICY "Admins can update showcase requests"
ON showcase_requests FOR UPDATE USING (
  has_role(auth.uid(), 'admin')
);

-- Add new update types to enum
ALTER TYPE update_type ADD VALUE IF NOT EXISTS 'SHOWCASE_REQUESTED';
ALTER TYPE update_type ADD VALUE IF NOT EXISTS 'SHOWCASE_APPROVED';
ALTER TYPE update_type ADD VALUE IF NOT EXISTS 'SHOWCASE_REJECTED';

-- Trigger function to handle showcase requests
CREATE OR REPLACE FUNCTION handle_showcase_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';
  project_title TEXT;
  requester_username TEXT;
  conv_id UUID;
BEGIN
  -- Get project title and requester info
  SELECT title INTO project_title FROM projects WHERE id = NEW.project_id;
  SELECT username INTO requester_username FROM profiles WHERE id = NEW.requester_id;

  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Add to timeline
    INSERT INTO project_updates (project_id, author_id, content, type)
    VALUES (NEW.project_id, NEW.requester_id, 'Publicação pública solicitada', 'SHOWCASE_REQUESTED');
    
    -- Find or create conversation with admin
    SELECT id INTO conv_id FROM conversations 
    WHERE (participant_1 = admin_user_id AND participant_2 = NEW.requester_id)
       OR (participant_1 = NEW.requester_id AND participant_2 = admin_user_id)
    LIMIT 1;
    
    IF conv_id IS NULL THEN
      INSERT INTO conversations (participant_1, participant_2, last_message_at)
      VALUES (admin_user_id, NEW.requester_id, now())
      RETURNING id INTO conv_id;
    END IF;
    
    -- Send message to admin
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (conv_id, NEW.requester_id, 
      '📢 **Solicitação de Publicação Pública**

🚀 Projeto: **' || project_title || '**

Gostaria de publicar meu projeto na página Discovery para atrair mais co-fundadores.

Por favor, revise e aprove se estiver tudo certo!');
    
    UPDATE conversations SET last_message_at = now() WHERE id = conv_id;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- Get conversation
    SELECT id INTO conv_id FROM conversations 
    WHERE (participant_1 = admin_user_id AND participant_2 = NEW.requester_id)
       OR (participant_1 = NEW.requester_id AND participant_2 = admin_user_id)
    LIMIT 1;
    
    IF NEW.status = 'approved' THEN
      -- Update project
      UPDATE projects SET is_showcase = true WHERE id = NEW.project_id;
      
      -- Add to timeline
      INSERT INTO project_updates (project_id, author_id, content, type)
      VALUES (NEW.project_id, NEW.reviewer_id, 'Publicação pública aprovada! ✅', 'SHOWCASE_APPROVED');
      
      -- Send approval message
      IF conv_id IS NOT NULL THEN
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (conv_id, admin_user_id, 
          '🎉 **Projeto Aprovado para Discovery!**

Seu projeto "**' || project_title || '**" agora está visível publicamente na página Discovery!

Boa sorte atraindo co-fundadores! 🚀');
        UPDATE conversations SET last_message_at = now() WHERE id = conv_id;
      END IF;
      
      -- Create notification
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (NEW.requester_id, 'showcase_approved', 
        '🎉 Projeto aprovado para Discovery!', 
        'Seu projeto "' || project_title || '" agora está visível publicamente!');
        
    ELSIF NEW.status = 'rejected' THEN
      -- Add to timeline
      INSERT INTO project_updates (project_id, author_id, content, type)
      VALUES (NEW.project_id, NEW.reviewer_id, 
        'Publicação rejeitada: ' || COALESCE(NEW.rejection_reason, 'Sem motivo especificado'), 
        'SHOWCASE_REJECTED');
      
      -- Send rejection message
      IF conv_id IS NOT NULL THEN
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (conv_id, admin_user_id, 
          '❌ **Solicitação de Publicação Negada**

Projeto: "**' || project_title || '**"

Motivo: ' || COALESCE(NEW.rejection_reason, 'Sem motivo especificado') || '

Você pode fazer ajustes e solicitar novamente.');
        UPDATE conversations SET last_message_at = now() WHERE id = conv_id;
      END IF;
      
      -- Create notification
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (NEW.requester_id, 'showcase_rejected', 
        '❌ Solicitação de publicação negada', 
        'Motivo: ' || COALESCE(NEW.rejection_reason, 'Sem motivo especificado'));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_showcase_request_change
  AFTER INSERT OR UPDATE ON showcase_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_showcase_request();