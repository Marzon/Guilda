-- Remove recursive trigger causing stack depth issues on waitlist_signups
DROP TRIGGER IF EXISTS update_queue_positions_trigger ON public.waitlist_signups;