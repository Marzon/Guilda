-- Add source column to matches table for tracking origin
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'unknown';

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_matches_source ON matches(source);

-- Add comment for documentation
COMMENT ON COLUMN matches.source IS 'Origin of match: grid, swipe, project_detail, ai_suggestion, profile_preview, unknown';