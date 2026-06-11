-- Allow admins to delete waitlist signups
CREATE POLICY "Admins can delete waitlist signups" 
ON waitlist_signups
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);