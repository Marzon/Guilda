-- Create a function to get applicant emails for project owners
CREATE OR REPLACE FUNCTION public.get_applicant_emails_for_project_owner(project_id_param uuid)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id_var uuid;
BEGIN
  -- Get the project owner
  SELECT owner_id INTO owner_id_var FROM projects WHERE id = project_id_param;
  
  -- Check if the caller is the project owner
  IF owner_id_var IS NULL OR owner_id_var != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You must be the project owner';
  END IF;
  
  -- Return emails of applicants for this project
  RETURN QUERY
  SELECT DISTINCT au.id as user_id, au.email::text
  FROM auth.users au
  INNER JOIN project_applications pa ON pa.applicant_id = au.id
  WHERE pa.project_id = project_id_param;
END;
$$;