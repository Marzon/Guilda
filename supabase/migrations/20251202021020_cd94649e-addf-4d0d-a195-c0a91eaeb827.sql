-- Fix calculate_queue_position function
CREATE OR REPLACE FUNCTION public.calculate_queue_position(signup_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invites_count INTEGER;
  signup_time TIMESTAMP WITH TIME ZONE;
  position INTEGER;
BEGIN
  SELECT invites_used, created_at INTO invites_count, signup_time
  FROM waitlist_signups
  WHERE id = signup_id;
  
  -- Count how many people came before
  SELECT COUNT(*) INTO position
  FROM waitlist_signups
  WHERE created_at < signup_time
    OR (created_at = signup_time AND id < signup_id);
  
  -- Position = (people before + 1) - (invite benefit)
  -- Each accepted invite makes you skip 2 positions
  position := GREATEST(1, (position + 1) - (invites_count * 2));
  
  RETURN position;
END;
$function$;

-- Recalculate all existing queue positions
UPDATE waitlist_signups
SET queue_position = calculate_queue_position(id);