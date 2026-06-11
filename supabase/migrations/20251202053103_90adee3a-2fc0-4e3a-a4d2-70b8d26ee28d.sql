-- Create chat-files storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true, -- Public bucket to allow direct PDF access
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users in accepted matches can manage files" ON storage.objects;

-- Allow authenticated users to upload files to their match folders
CREATE POLICY "Users can upload files to their matches"
ON storage.objects
FOR INSERT
TO authenticated
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

-- Allow anyone to view files (public bucket)
CREATE POLICY "Anyone can view chat files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-files');

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete files from their matches"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM messages
    WHERE 
      file_url = (storage.objects.bucket_id || '/' || storage.objects.name) AND
      sender_id = auth.uid()
  )
);