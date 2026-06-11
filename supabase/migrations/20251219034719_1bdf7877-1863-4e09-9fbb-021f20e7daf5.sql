-- Add request_type column to differentiate between owner-initiated and admin-initiated requests
ALTER TABLE public.showcase_requests 
ADD COLUMN request_type TEXT NOT NULL DEFAULT 'owner_request';

-- Add comment for documentation
COMMENT ON COLUMN public.showcase_requests.request_type IS 'Type of request: owner_request (owner asks admin) or admin_suggestion (admin suggests to owner)';

-- Create or replace the trigger function to handle showcase approval
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
      CASE 
        WHEN NEW.request_type = 'admin_suggestion' THEN 'SHOWCASE_APPROVED'
        ELSE 'SHOWCASE_APPROVED'
      END,
      CASE 
        WHEN NEW.request_type = 'admin_suggestion' THEN 'Proprietário aprovou sugestão do admin para publicar no Discovery'
        ELSE 'Projeto aprovado para publicação no Discovery'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_showcase_request_approval ON public.showcase_requests;
CREATE TRIGGER on_showcase_request_approval
  AFTER UPDATE ON public.showcase_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_showcase_request_approval();

-- Update RLS policy to allow admins to insert suggestions
DROP POLICY IF EXISTS "Admins can create showcase suggestions" ON public.showcase_requests;
CREATE POLICY "Admins can create showcase suggestions" 
ON public.showcase_requests 
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND request_type = 'admin_suggestion'
);

-- Update policy to allow owners to approve admin suggestions
DROP POLICY IF EXISTS "Owners can approve admin suggestions" ON public.showcase_requests;
CREATE POLICY "Owners can approve admin suggestions" 
ON public.showcase_requests 
FOR UPDATE
USING (
  request_type = 'admin_suggestion' 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = showcase_requests.project_id 
    AND projects.owner_id = auth.uid()
  )
);