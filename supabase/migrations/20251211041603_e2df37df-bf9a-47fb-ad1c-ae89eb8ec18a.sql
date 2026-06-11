-- Drop old policies that incorrectly reference matches table
DROP POLICY IF EXISTS "Users can upload files to their matches" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their matches" ON storage.objects;
DROP POLICY IF EXISTS "Match participants can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files from their matches" ON storage.objects;

-- Create new policies that correctly reference conversations table
CREATE POLICY "Users can upload files to their conversations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id::text = (storage.foldername(name))[1]
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can view files in their conversations"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-files' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id::text = (storage.foldername(name))[1]
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can update files in their conversations"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id::text = (storage.foldername(name))[1]
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id::text = (storage.foldername(name))[1]
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can delete files in their conversations"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.file_url LIKE '%' || objects.name
    AND messages.sender_id = auth.uid()
  )
);