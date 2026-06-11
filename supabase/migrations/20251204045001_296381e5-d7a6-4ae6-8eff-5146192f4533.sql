-- Add scheduling support to admin_broadcasts
ALTER TABLE admin_broadcasts 
ADD COLUMN scheduled_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient lookup of scheduled broadcasts
CREATE INDEX idx_admin_broadcasts_scheduled 
ON admin_broadcasts(scheduled_at) 
WHERE status = 'scheduled';