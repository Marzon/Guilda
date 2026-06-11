-- Drop any existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Allow public read access" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Public can read audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Anyone can view audit log" ON public.admin_audit_log;

-- Create a secure policy that only allows admins to view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));