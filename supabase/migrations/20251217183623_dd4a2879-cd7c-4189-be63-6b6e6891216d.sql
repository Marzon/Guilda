-- Create storage bucket for project logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-logos', 'project-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their project logos
CREATE POLICY "Users can upload project logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-logos' 
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view project logos (public)
CREATE POLICY "Anyone can view project logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-logos');

-- Allow users to update their own project logos
CREATE POLICY "Users can update own project logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own project logos
CREATE POLICY "Users can delete own project logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-logos' AND auth.uid()::text = (storage.foldername(name))[1]);