-- Drop existing trigger (only fires on UPDATE OF member_status)
DROP TRIGGER IF EXISTS trigger_sync_tier_on_status_change ON public.subscriptions;

-- Create expanded trigger (fires on INSERT OR UPDATE)
CREATE TRIGGER trigger_sync_tier_on_cohort_change
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_tier_with_member_status();