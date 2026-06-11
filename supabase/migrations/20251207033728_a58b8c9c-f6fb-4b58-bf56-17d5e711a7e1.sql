-- Create banned_users table for admin bans
CREATE TABLE public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Only admins can manage bans
CREATE POLICY "Admins can manage bans" ON public.banned_users FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view bans
CREATE POLICY "Admins can view bans" ON public.banned_users FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete showcase projects
CREATE POLICY "Admins can delete showcase projects" ON public.projects FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin') AND is_showcase = true);