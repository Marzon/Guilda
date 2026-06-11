-- Create message_reactions table for WhatsApp-style reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions in their matches
CREATE POLICY "Users can view reactions in their matches"
ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN matches mt ON m.match_id = mt.id
    WHERE m.id = message_reactions.message_id
      AND (mt.requester_id = auth.uid() OR mt.target_id = auth.uid())
      AND mt.status = 'ACCEPTED'
  )
);

-- Users can add reactions in their matches
CREATE POLICY "Users can add reactions in their matches"
ON public.message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN matches mt ON m.match_id = mt.id
    WHERE m.id = message_reactions.message_id
      AND (mt.requester_id = auth.uid() OR mt.target_id = auth.uid())
      AND mt.status = 'ACCEPTED'
  )
);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;