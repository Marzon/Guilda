-- Add is_archived column to conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_archived_by_1 boolean DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_archived_by_2 boolean DEFAULT false;

-- Add policy to allow users to delete their own conversations
CREATE POLICY "Users can delete their conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);