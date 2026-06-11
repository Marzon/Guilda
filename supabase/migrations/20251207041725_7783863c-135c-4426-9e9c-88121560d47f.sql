-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view favorites count" ON public.project_favorites;

-- Create new policy restricting to authenticated users only
CREATE POLICY "Authenticated users can view favorites" 
ON public.project_favorites 
FOR SELECT 
USING (auth.uid() IS NOT NULL);