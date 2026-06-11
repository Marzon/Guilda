-- Add soft delete columns to conversations table
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS is_deleted_by_1 BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted_by_2 BOOLEAN DEFAULT false;

-- Add soft delete column to group_conversation_members table
ALTER TABLE group_conversation_members 
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;