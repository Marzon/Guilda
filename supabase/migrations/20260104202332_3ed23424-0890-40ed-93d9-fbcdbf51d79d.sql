-- Function to check admin access AND log the access attempt
CREATE OR REPLACE FUNCTION public.check_and_log_deleted_profiles_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  admin_user_id uuid;
BEGIN
  admin_user_id := auth.uid();
  
  -- Check if user is admin
  is_admin := (admin_user_id = 'f14d6435-6eb7-4585-8146-ef9f3e29c2c1'::uuid);
  
  -- Log the access attempt (successful or not)
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.admin_audit_log (
      admin_id,
      action,
      target_table,
      target_id,
      old_value,
      new_value
    ) VALUES (
      admin_user_id,
      'SELECT',
      'deleted_profiles',
      NULL,
      NULL,
      jsonb_build_object('access_granted', is_admin, 'timestamp', now())
    );
  END IF;
  
  RETURN is_admin;
END;
$$;

-- Drop existing policies on deleted_profiles if they exist
DROP POLICY IF EXISTS "Admin can view deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Only admin can view deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Admins can view deleted profiles" ON public.deleted_profiles;

-- Create new RLS policy with audit logging
CREATE POLICY "Admin can view deleted profiles with audit"
ON public.deleted_profiles
FOR SELECT
TO authenticated
USING (public.check_and_log_deleted_profiles_access());

-- Ensure RLS is enabled
ALTER TABLE public.deleted_profiles ENABLE ROW LEVEL SECURITY;

-- Restrict INSERT to only the soft-delete function (service role or specific function)
DROP POLICY IF EXISTS "Only system can insert deleted profiles" ON public.deleted_profiles;
CREATE POLICY "Only system can insert deleted profiles"
ON public.deleted_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only admin can manually insert (for data recovery scenarios)
  auth.uid() = 'f14d6435-6eb7-4585-8146-ef9f3e29c2c1'::uuid
);

-- No UPDATE allowed - deleted data should be immutable
DROP POLICY IF EXISTS "No updates to deleted profiles" ON public.deleted_profiles;
CREATE POLICY "No updates to deleted profiles"
ON public.deleted_profiles
FOR UPDATE
TO authenticated
USING (false);

-- Only admin can permanently delete (GDPR compliance)
DROP POLICY IF EXISTS "Admin can permanently delete profiles" ON public.deleted_profiles;
CREATE POLICY "Admin can permanently delete profiles"
ON public.deleted_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = 'f14d6435-6eb7-4585-8146-ef9f3e29c2c1'::uuid);