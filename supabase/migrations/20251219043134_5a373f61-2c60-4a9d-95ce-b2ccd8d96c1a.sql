-- Fix: The policies incorrectly allow access when group_conversation_id IS NULL
-- This exposes all regular messages to anyone

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view group messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send group messages" ON public.messages;

-- Recreate with correct logic - only apply to group messages (where group_conversation_id IS NOT NULL)
CREATE POLICY "Users can view group messages" 
ON public.messages 
FOR SELECT 
USING (
  (group_conversation_id IS NOT NULL) 
  AND is_group_conversation_member(group_conversation_id, auth.uid())
);

CREATE POLICY "Users can send group messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  (sender_id = auth.uid())
  AND (group_conversation_id IS NOT NULL) 
  AND is_group_conversation_member(group_conversation_id, auth.uid())
);