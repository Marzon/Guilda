-- Create private bucket for payment receipts (NOT public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "Anyone can view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view payment receipts" ON storage.objects;

-- Users can only view their own payment receipts (folder structure: user_id/filename)
DROP POLICY IF EXISTS "Users can view own payment receipts" ON storage.objects;
CREATE POLICY "Users can view own payment receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own payment receipts
DROP POLICY IF EXISTS "Users can upload own payment receipts" ON storage.objects;
CREATE POLICY "Users can upload own payment receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own payment receipts
DROP POLICY IF EXISTS "Users can update own payment receipts" ON storage.objects;
CREATE POLICY "Users can update own payment receipts"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own payment receipts
DROP POLICY IF EXISTS "Users can delete own payment receipts" ON storage.objects;
CREATE POLICY "Users can delete own payment receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all payment receipts (for verification)
DROP POLICY IF EXISTS "Admins can view all payment receipts" ON storage.objects;
CREATE POLICY "Admins can view all payment receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND has_role(auth.uid(), 'admin'::app_role)
);