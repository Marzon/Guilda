-- Add 'expired' status to showcase_requests
-- First drop the existing check constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'showcase_requests_status_check'
  ) THEN
    ALTER TABLE showcase_requests DROP CONSTRAINT showcase_requests_status_check;
  END IF;
END $$;

-- Add new check constraint with 'expired' status
ALTER TABLE showcase_requests 
ADD CONSTRAINT showcase_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'expired'));

-- Add SHOWCASE_EXPIRED to update_type enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SHOWCASE_EXPIRED' AND enumtypid = 'update_type'::regtype) THEN
    ALTER TYPE update_type ADD VALUE 'SHOWCASE_EXPIRED';
  END IF;
END $$;