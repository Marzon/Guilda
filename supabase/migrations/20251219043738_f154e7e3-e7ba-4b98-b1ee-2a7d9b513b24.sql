-- Add admin access to broadcast_recipients table
-- This provides proper admin oversight alongside service role access

-- Allow admins to view broadcast recipients
CREATE POLICY "Admins can view broadcast recipients" 
ON public.broadcast_recipients 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage broadcast recipients (for manual cleanup if needed)
CREATE POLICY "Admins can manage broadcast recipients" 
ON public.broadcast_recipients 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));