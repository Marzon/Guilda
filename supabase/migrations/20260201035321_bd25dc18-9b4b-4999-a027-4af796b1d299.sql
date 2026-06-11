-- Remove the policy causing infinite recursion
-- The correct policy "Members can view participants of their conversations" already exists
-- and uses the is_group_conversation_member() security definer function

DROP POLICY IF EXISTS "Members can view their conversation members" 
ON public.group_conversation_members;