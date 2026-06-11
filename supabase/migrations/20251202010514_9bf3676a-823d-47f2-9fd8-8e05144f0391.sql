-- Fix recursive trigger on waitlist_signups causing stack depth errors
DROP TRIGGER IF EXISTS on_waitlist_change ON public.waitlist_signups;
DROP TRIGGER IF EXISTS update_queue_positions_trigger ON public.waitlist_signups;

-- Make update_queue_positions compute position only for the affected row
CREATE OR REPLACE FUNCTION public.update_queue_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Set queue_position directly on the new/updated row without extra UPDATE
  NEW.queue_position := calculate_queue_position(NEW.id);
  RETURN NEW;
END;
$function$;

-- Recreate a safe trigger that runs before insert/update
CREATE TRIGGER on_waitlist_change
BEFORE INSERT OR UPDATE ON public.waitlist_signups
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions();