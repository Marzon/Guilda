-- Add is_demo column to projects table to distinguish fake/test data from real projects
ALTER TABLE public.projects ADD COLUMN is_demo BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.projects.is_demo IS 'True for fake/test projects created by populate-fake-data, false for real user projects';

-- Update RLS policy to allow admins to delete demo projects (not showcase projects)
DROP POLICY IF EXISTS "Admins can delete showcase projects" ON public.projects;

CREATE POLICY "Admins can delete demo projects" 
ON public.projects 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) AND (is_demo = true));