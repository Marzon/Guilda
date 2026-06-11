-- Drop the restrictive policy that only allows viewing own membership
DROP POLICY IF EXISTS "Users can view own group memberships" ON group_conversation_members;

-- Create new policy that allows members to see ALL participants of their conversations
-- Uses the security definer function to avoid RLS recursion
CREATE POLICY "Members can view participants of their conversations"
ON group_conversation_members
FOR SELECT
USING (
  is_group_conversation_member(conversation_id, auth.uid())
);