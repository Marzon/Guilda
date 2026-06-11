-- Step 1: Add agent_type column
ALTER TABLE acceleration_agent_config 
ADD COLUMN agent_type TEXT NOT NULL DEFAULT 'COMMANDER';