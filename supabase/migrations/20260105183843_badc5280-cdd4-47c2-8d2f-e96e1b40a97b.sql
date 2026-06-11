-- Drop existing function and policies that use the wrong admin ID
DROP FUNCTION IF EXISTS public.check_and_log_deleted_profiles_access CASCADE;

-- Recreate the function with the correct admin ID
CREATE OR REPLACE FUNCTION public.check_and_log_deleted_profiles_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  correct_admin_id uuid := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';
BEGIN
  -- Check if the current user is the admin
  IF auth.uid() = correct_admin_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop and recreate RLS policies for deleted_profiles with correct admin ID
DROP POLICY IF EXISTS "Admin can view deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Admin can manually insert deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Admin can permanently delete profiles" ON public.deleted_profiles;

-- Recreate policies using the function
CREATE POLICY "Admin can view deleted profiles" 
ON public.deleted_profiles 
FOR SELECT 
USING (public.check_and_log_deleted_profiles_access());

CREATE POLICY "Admin can manually insert deleted profiles" 
ON public.deleted_profiles 
FOR INSERT 
WITH CHECK (public.check_and_log_deleted_profiles_access());

CREATE POLICY "Admin can permanently delete profiles" 
ON public.deleted_profiles 
FOR DELETE 
USING (public.check_and_log_deleted_profiles_access());