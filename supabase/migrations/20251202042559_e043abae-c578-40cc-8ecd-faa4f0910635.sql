-- Create function to consolidate duplicate accepted matches
CREATE OR REPLACE FUNCTION consolidate_accepted_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACCEPTED' THEN
    -- Delete reverse match if it exists
    DELETE FROM matches 
    WHERE requester_id = NEW.target_id 
      AND target_id = NEW.requester_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for accepted matches
CREATE TRIGGER on_match_accepted
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'ACCEPTED' AND OLD.status IS DISTINCT FROM 'ACCEPTED')
  EXECUTE FUNCTION consolidate_accepted_match();

-- Clean existing duplicate data (keep the first match between each pair)
DELETE FROM matches m1
WHERE m1.status = 'ACCEPTED'
  AND EXISTS (
    SELECT 1 FROM matches m2
    WHERE m2.status = 'ACCEPTED'
      AND m2.id < m1.id
      AND (
        (m2.requester_id = m1.requester_id AND m2.target_id = m1.target_id)
        OR (m2.requester_id = m1.target_id AND m2.target_id = m1.requester_id)
      )
  );