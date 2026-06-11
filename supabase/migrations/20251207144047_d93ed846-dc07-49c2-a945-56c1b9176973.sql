-- Fix: Require authentication to view project members
DROP POLICY IF EXISTS "Public can view active members only" ON public.project_members;

CREATE POLICY "Authenticated users can view active members"
ON public.project_members
FOR SELECT
USING (auth.uid() IS NOT NULL AND status = 'ACTIVE'::member_status);