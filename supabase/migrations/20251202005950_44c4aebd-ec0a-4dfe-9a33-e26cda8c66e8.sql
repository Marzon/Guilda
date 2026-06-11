-- Fix the update_queue_positions trigger to avoid RLS issues
DROP TRIGGER IF EXISTS update_queue_positions_trigger ON waitlist_signups;

-- Recreate the trigger function with proper WHERE clause
CREATE OR REPLACE FUNCTION public.update_queue_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only update the new signup's position
  UPDATE waitlist_signups
  SET queue_position = calculate_queue_position(NEW.id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER update_queue_positions_trigger
AFTER INSERT ON waitlist_signups
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions();