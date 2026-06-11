CREATE OR REPLACE FUNCTION public.handle_showcase_request_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Update the project to be showcased
    UPDATE public.projects 
    SET is_showcase = true, updated_at = now()
    WHERE id = NEW.project_id;
    
    -- Add a timeline entry based on request type
    INSERT INTO public.project_updates (project_id, author_id, type, content)
    VALUES (
      NEW.project_id,
      COALESCE(NEW.reviewer_id, NEW.requester_id),
      'SHOWCASE_APPROVED'::update_type,
      CASE 
        WHEN NEW.request_type = 'admin_suggestion' THEN 'Proprietário aprovou sugestão do admin para publicar no Discovery'
        ELSE 'Projeto aprovado para publicação no Discovery'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;