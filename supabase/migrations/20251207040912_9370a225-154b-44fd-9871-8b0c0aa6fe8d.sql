-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view project roles" ON public.project_roles;

-- Create new policy restricting to authenticated users only
CREATE POLICY "Authenticated users can view project roles" 
ON public.project_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);