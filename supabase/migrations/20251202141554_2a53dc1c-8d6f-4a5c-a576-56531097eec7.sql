-- Remove the public SELECT policy from chat-files bucket
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

-- Create new policy: Only match participants can view chat files
CREATE POLICY "Match participants can view chat files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id::text = (storage.foldername(name))[1]
    AND (m.requester_id = auth.uid() OR m.target_id = auth.uid())
    AND m.status = 'ACCEPTED'
  )
);