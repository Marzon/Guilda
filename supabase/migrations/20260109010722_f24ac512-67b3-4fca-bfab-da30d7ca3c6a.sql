-- Drop the current restrictive delete policy
DROP POLICY IF EXISTS "Service role can delete deleted profiles" ON public.deleted_profiles;

-- Create new policy allowing admins to delete from deleted_profiles
CREATE POLICY "Admins can delete deleted profiles"
ON public.deleted_profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));