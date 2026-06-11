-- Fix projects table to require authentication
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

-- Add missing DELETE policy for matches table
CREATE POLICY "Users can delete their own match requests"
  ON public.matches FOR DELETE
  USING (auth.uid() = requester_id);

-- Add missing DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);