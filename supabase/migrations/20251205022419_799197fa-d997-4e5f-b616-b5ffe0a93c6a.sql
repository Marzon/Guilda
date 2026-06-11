-- Drop the existing permissive policy that allows anyone to view all projects
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

-- Create new policy: Public can only view showcase projects (for SEO/discover page)
CREATE POLICY "Public can view showcase projects" 
ON public.projects 
FOR SELECT 
USING (is_showcase = true);

-- Create policy: Authenticated users can view all projects
CREATE POLICY "Authenticated users can view all projects" 
ON public.projects 
FOR SELECT 
TO authenticated
USING (true);