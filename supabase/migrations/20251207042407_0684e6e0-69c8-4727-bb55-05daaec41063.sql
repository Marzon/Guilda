-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view user skills" ON public.user_skills;

-- Create policy requiring authentication to view user skills
CREATE POLICY "Authenticated users can view user skills" 
ON public.user_skills 
FOR SELECT 
USING (auth.uid() IS NOT NULL);