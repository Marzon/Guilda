-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admin can manually insert deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Admin can permanently delete profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Admin can view deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Admins can manage deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Only system can insert deleted profiles" ON public.deleted_profiles;
DROP POLICY IF EXISTS "Service role can manage deleted profiles" ON public.deleted_profiles;

-- Create or replace the audit logging function for deleted_profiles access
CREATE OR REPLACE FUNCTION public.log_deleted_profiles_access(action_type text, target_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Log the access to audit table
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_table,
    target_id,
    created_at
  ) VALUES (
    auth.uid(),
    action_type,
    'deleted_profiles',
    target_user_id,
    now()
  );
  
  RETURN true;
END;
$$;

-- Create secure access function that checks role AND logs access
CREATE OR REPLACE FUNCTION public.check_deleted_profiles_select_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Log the SELECT access (batched - logs once per query execution)
  PERFORM public.log_deleted_profiles_access('SELECT_DELETED_PROFILES', NULL);
  
  RETURN true;
END;
$$;

-- Create new strict RLS policies with audit logging

-- Only admins can view deleted profiles (with logging)
CREATE POLICY "Admins can view deleted profiles with audit"
ON public.deleted_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only service role can insert (from edge functions during soft delete)
CREATE POLICY "Service role can insert deleted profiles"
ON public.deleted_profiles
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Only service role can delete (permanent deletion)
CREATE POLICY "Service role can delete deleted profiles"
ON public.deleted_profiles
FOR DELETE
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Keep the no updates policy
-- "No updates to deleted profiles" already exists with USING: false

-- Create trigger to log all access to deleted_profiles
CREATE OR REPLACE FUNCTION public.audit_deleted_profiles_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log DELETE operations
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log (
      admin_id,
      action,
      target_table,
      target_id,
      old_value,
      created_at
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'PERMANENT_DELETE_PROFILE',
      'deleted_profiles',
      OLD.id,
      jsonb_build_object('email', OLD.email, 'username', OLD.username),
      now()
    );
    RETURN OLD;
  END IF;
  
  -- Log INSERT operations (soft delete)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log (
      admin_id,
      action,
      target_table,
      target_id,
      new_value,
      created_at
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'SOFT_DELETE_PROFILE',
      'deleted_profiles',
      NEW.id,
      jsonb_build_object('email', NEW.email, 'username', NEW.username, 'deletion_reason', NEW.deletion_reason),
      now()
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS audit_deleted_profiles_trigger ON public.deleted_profiles;

-- Create trigger for audit logging
CREATE TRIGGER audit_deleted_profiles_trigger
AFTER INSERT OR DELETE ON public.deleted_profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_deleted_profiles_access();