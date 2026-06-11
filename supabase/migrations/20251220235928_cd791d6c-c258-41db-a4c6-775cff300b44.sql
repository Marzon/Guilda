-- Drop the existing policy that only allows deleting demo projects
DROP POLICY IF EXISTS "Admins can delete demo projects" ON public.projects;

-- Create new policy that allows admins to delete ANY project
CREATE POLICY "Admins can delete any project" 
ON public.projects 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));