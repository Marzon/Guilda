-- Trigger to prevent match requests to/from investors
-- Investors should use the Capital page for direct messaging, not the match system

CREATE OR REPLACE FUNCTION public.prevent_investor_matches()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if target is an investor
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.target_id 
    AND archetype = 'INVESTOR'
  ) THEN
    RAISE EXCEPTION 'Cannot send match requests to investors. Use the Capital page to contact them directly.';
  END IF;
  
  -- Check if requester is an investor
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.requester_id 
    AND archetype = 'INVESTOR'
  ) THEN
    RAISE EXCEPTION 'Investors cannot send match requests. Founders will contact you through the Capital page.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on matches table
DROP TRIGGER IF EXISTS check_investor_match ON public.matches;
CREATE TRIGGER check_investor_match
BEFORE INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.prevent_investor_matches();