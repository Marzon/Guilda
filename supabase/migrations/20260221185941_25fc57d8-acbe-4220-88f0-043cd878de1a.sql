
-- Create a public storage bucket for OG images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('og-images', 'og-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "OG images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'og-images');

-- Allow admin to upload
CREATE POLICY "Admin can upload OG images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'og-images' AND auth.uid() = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'::uuid);
