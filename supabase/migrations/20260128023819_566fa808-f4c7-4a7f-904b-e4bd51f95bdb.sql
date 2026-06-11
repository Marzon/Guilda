-- Trigger de segurança para auto-matrícula quando aplicação é aprovada
CREATE OR REPLACE FUNCTION auto_enroll_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND NEW.cohort_id IS NOT NULL THEN
    INSERT INTO acceleration_user_progress (user_id, cohort_id, current_day, status, started_at)
    VALUES (NEW.user_id, NEW.cohort_id, 1, 'ACTIVE', NOW())
    ON CONFLICT (user_id, cohort_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS trigger_auto_enroll_on_approval ON acceleration_applications;

-- Create trigger that fires when status changes to APPROVED
CREATE TRIGGER trigger_auto_enroll_on_approval
  AFTER UPDATE ON acceleration_applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'APPROVED')
  EXECUTE FUNCTION auto_enroll_on_approval();