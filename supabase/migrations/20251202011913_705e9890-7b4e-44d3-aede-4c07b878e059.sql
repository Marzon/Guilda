-- Allow admins to update waitlist signups (approve/unapprove)
CREATE POLICY "Admins can update waitlist signups"
ON public.waitlist_signups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);