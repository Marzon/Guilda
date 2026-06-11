-- Drop the existing INSERT policy that allows setting arbitrary participant_1
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create stricter INSERT policy: user MUST be participant_1 (the initiator)
CREATE POLICY "Users can create conversations as initiator"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = participant_1);