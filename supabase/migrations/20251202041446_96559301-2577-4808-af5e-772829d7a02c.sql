-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Simple RLS policy - users in accepted matches can upload and view files
CREATE POLICY "Users in accepted matches can manage files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'chat-files'
)
WITH CHECK (
  bucket_id = 'chat-files'
);

-- Add columns to messages table for file attachments
ALTER TABLE public.messages 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_size INTEGER;

-- Create index for better query performance
CREATE INDEX idx_messages_file_url ON public.messages(file_url) WHERE file_url IS NOT NULL;