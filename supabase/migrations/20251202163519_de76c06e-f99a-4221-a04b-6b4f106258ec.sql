-- Fix RLS policy for waitlist_signups to allow both anonymous and authenticated users
DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON waitlist_signups;

CREATE POLICY "Anyone can sign up for waitlist"
ON waitlist_signups FOR INSERT
TO public, authenticated
WITH CHECK (true);

-- Set default for queue_position as fallback
ALTER TABLE waitlist_signups 
ALTER COLUMN queue_position SET DEFAULT 9999;

-- Create trigger for auto-calculating queue_position (if not exists)
DROP TRIGGER IF EXISTS set_queue_position ON waitlist_signups;

CREATE TRIGGER set_queue_position
BEFORE INSERT ON waitlist_signups
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions();