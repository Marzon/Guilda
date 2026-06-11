-- Create function to decrement counter offset
CREATE OR REPLACE FUNCTION public.decrement_counter_offset()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT value INTO current_value 
  FROM waitlist_config 
  WHERE key = 'counter_offset';
  
  IF current_value > 0 THEN
    UPDATE waitlist_config 
    SET value = value - 1 
    WHERE key = 'counter_offset';
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Add RLS policy to allow the function to update waitlist_config
CREATE POLICY "Allow decrement function to update config"
ON waitlist_config
FOR UPDATE
USING (true)
WITH CHECK (true);