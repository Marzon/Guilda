-- Fix xp_to_level function to have proper search_path
CREATE OR REPLACE FUNCTION public.xp_to_level(p_xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(1, FLOOR(1 + SQRT(p_xp::numeric / 50))::integer)
$$;