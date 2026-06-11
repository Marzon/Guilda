-- Enable RLS on waitlist_signups if not already enabled
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might allow public access
DROP POLICY IF EXISTS "Anyone can view waitlist signups" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Public can view waitlist signups" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Authenticated users can view waitlist signups" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Users can view own waitlist signup" ON public.waitlist_signups;

-- Create admin-only SELECT policy
DROP POLICY IF EXISTS "Admins can view all waitlist signups" ON public.waitlist_signups;
CREATE POLICY "Admins can view all waitlist signups"
ON public.waitlist_signups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only INSERT policy (for bulk imports/migrations)
DROP POLICY IF EXISTS "Admins can insert waitlist signups" ON public.waitlist_signups;
CREATE POLICY "Admins can insert waitlist signups"
ON public.waitlist_signups
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role and anonymous inserts for waitlist signup form (public facing)
DROP POLICY IF EXISTS "Anyone can signup for waitlist" ON public.waitlist_signups;
CREATE POLICY "Anyone can signup for waitlist"
ON public.waitlist_signups
FOR INSERT
WITH CHECK (true);

-- Create admin-only UPDATE policy
DROP POLICY IF EXISTS "Admins can update waitlist signups" ON public.waitlist_signups;
CREATE POLICY "Admins can update waitlist signups"
ON public.waitlist_signups
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only DELETE policy
DROP POLICY IF EXISTS "Admins can delete waitlist signups" ON public.waitlist_signups;
CREATE POLICY "Admins can delete waitlist signups"
ON public.waitlist_signups
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));