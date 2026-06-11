-- Allow admins to manage user_roles (add batch_manager role, etc.)
CREATE POLICY "Admins can manage user_roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));