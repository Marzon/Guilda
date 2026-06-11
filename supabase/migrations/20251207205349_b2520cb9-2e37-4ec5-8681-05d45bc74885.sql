-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can view pix config" ON public.pix_config;

-- Create a new policy allowing anyone to view pix config (public read)
CREATE POLICY "Anyone can view pix config" 
ON public.pix_config 
FOR SELECT 
USING (true);