-- Fix search_path security issue for the auto_enroll_on_approval function
CREATE OR REPLACE FUNCTION auto_enroll_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND NEW.cohort_id IS NOT NULL THEN
    INSERT INTO public.acceleration_user_progress (user_id, cohort_id, current_day, status, started_at)
    VALUES (NEW.user_id, NEW.cohort_id, 1, 'ACTIVE', NOW())
    ON CONFLICT (user_id, cohort_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;