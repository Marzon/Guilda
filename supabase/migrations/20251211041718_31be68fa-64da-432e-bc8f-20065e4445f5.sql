-- Drop old policies that incorrectly reference match_id
DROP POLICY IF EXISTS "Users can add reactions in their matches" ON message_reactions;
DROP POLICY IF EXISTS "Users can view reactions in their matches" ON message_reactions;

-- Create new policies that correctly reference conversation_id
CREATE POLICY "Users can add reactions in their conversations"
ON message_reactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can view reactions in their conversations"
ON message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);