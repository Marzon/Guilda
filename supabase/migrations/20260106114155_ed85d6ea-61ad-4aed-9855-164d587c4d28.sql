-- Create trigger function to sync tier with member_status
CREATE OR REPLACE FUNCTION public.sync_tier_with_member_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act if cohort_id exists
  IF NEW.cohort_id IS NOT NULL THEN
    IF NEW.member_status IN ('ENROLLED', 'ACTIVE', 'GRADUATED') THEN
      NEW.tier := 'ALPHA';
    ELSIF NEW.member_status IN ('DROPPED', 'REMOVED') THEN
      NEW.tier := 'FREE';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on subscriptions table
CREATE TRIGGER trigger_sync_tier_on_status_change
  BEFORE UPDATE OF member_status ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_tier_with_member_status();

-- Fix existing inconsistent data
UPDATE public.subscriptions
SET tier = 'FREE'
WHERE member_status IN ('DROPPED', 'REMOVED')
  AND tier != 'FREE';