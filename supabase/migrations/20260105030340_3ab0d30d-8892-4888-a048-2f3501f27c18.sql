-- Drop existing incorrect policy
DROP POLICY IF EXISTS "Users can view own profile views" ON public.profile_views;

-- Create correct policy: users can see who viewed their profile
CREATE POLICY "Users can see who viewed their profile" 
ON public.profile_views 
FOR SELECT 
USING (auth.uid() = viewed_profile_id OR auth.uid() = viewer_id);