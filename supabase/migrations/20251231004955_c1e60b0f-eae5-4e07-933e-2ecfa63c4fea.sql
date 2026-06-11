-- Add public read policy for open project roles (jobs directory)
CREATE POLICY "Public can view open project roles"
ON public.project_roles
FOR SELECT
USING (is_filled = false);

-- Add public read policy for profiles (needed for job cards to show owner info)
CREATE POLICY "Public can view profiles for jobs"
ON public.profiles
FOR SELECT
USING (true);