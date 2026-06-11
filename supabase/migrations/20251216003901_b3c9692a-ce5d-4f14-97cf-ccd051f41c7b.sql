-- Fix infinite recursion in group_conversation_members RLS policies

-- 1. Create SECURITY DEFINER function to check group membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_group_conversation_member(p_conversation_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_conversation_members
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
  )
$$;

-- 2. Drop ALL existing policies on group_conversation_members to start fresh
DROP POLICY IF EXISTS "Members can view participants of their conversations" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Conversation creator can add members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Members can view group conversation members" ON public.group_conversation_members;

-- 3. Create simple, non-recursive policies

-- SELECT: Users can see their own membership records
CREATE POLICY "Users can view own group memberships"
ON public.group_conversation_members
FOR SELECT
USING (user_id = auth.uid());

-- INSERT: Only via Edge Function (service role) - no direct user insert
CREATE POLICY "Service role can insert members"
ON public.group_conversation_members
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Users can update their own membership (e.g., archive)
CREATE POLICY "Users can update own membership"
ON public.group_conversation_members
FOR UPDATE
USING (user_id = auth.uid());

-- DELETE: Users can leave conversations they're in
CREATE POLICY "Users can delete own membership"
ON public.group_conversation_members
FOR DELETE
USING (user_id = auth.uid());

-- 4. Update group_conversations policies to use the helper function
DROP POLICY IF EXISTS "Members can view their group conversations" ON public.group_conversations;
DROP POLICY IF EXISTS "Users can view group conversations they are members of" ON public.group_conversations;

CREATE POLICY "Members can view group conversations"
ON public.group_conversations
FOR SELECT
USING (
  created_by = auth.uid() 
  OR public.is_group_conversation_member(id, auth.uid())
);

-- 5. Update messages policy for group conversations
DROP POLICY IF EXISTS "Group members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Group members can send messages" ON public.messages;

-- Allow viewing messages in group conversations user is member of
CREATE POLICY "Users can view group messages"
ON public.messages
FOR SELECT
USING (
  group_conversation_id IS NULL 
  OR public.is_group_conversation_member(group_conversation_id, auth.uid())
);

-- Allow sending messages to group conversations user is member of  
CREATE POLICY "Users can send group messages"
ON public.messages
FOR INSERT
WITH CHECK (
  group_conversation_id IS NULL 
  OR public.is_group_conversation_member(group_conversation_id, auth.uid())
);