-- Create RPC function to get platform stats for landing page
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_profiles bigint,
  total_matches bigint,
  total_projects bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles)::bigint as total_profiles,
    (SELECT COUNT(*) FROM matches WHERE status = 'ACCEPTED')::bigint as total_matches,
    (SELECT COUNT(*) FROM projects)::bigint as total_projects;
END;
$$;