-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view project members" ON public.project_members;

-- Create policy for project participants (owner + members) to see ALL members
CREATE POLICY "Project participants can view all members" 
ON public.project_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = project_members.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'ACTIVE'
  )
);

-- Create policy for public to see only ACTIVE members (for project discovery)
CREATE POLICY "Public can view active members only" 
ON public.project_members 
FOR SELECT 
USING (status = 'ACTIVE');