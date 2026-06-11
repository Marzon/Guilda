-- Create dedicated bucket for acceleration files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'acceleration-files',
  'acceleration-files',
  true,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'video/mp4', 'audio/mpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for acceleration-files bucket
CREATE POLICY "Users can upload to acceleration-files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'acceleration-files');

CREATE POLICY "Anyone can view acceleration files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'acceleration-files');

CREATE POLICY "Users can delete their own acceleration files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'acceleration-files' AND (storage.foldername(name))[1] = auth.uid()::text);