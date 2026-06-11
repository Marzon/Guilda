-- Add UPDATE policy for chat files (was missing)
CREATE POLICY "Users can update files in their matches"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE 
      id::text = (storage.foldername(name))[1] AND
      (requester_id = auth.uid() OR target_id = auth.uid()) AND
      status = 'ACCEPTED'
  )
)
WITH CHECK (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE 
      id::text = (storage.foldername(name))[1] AND
      (requester_id = auth.uid() OR target_id = auth.uid()) AND
      status = 'ACCEPTED'
  )
);