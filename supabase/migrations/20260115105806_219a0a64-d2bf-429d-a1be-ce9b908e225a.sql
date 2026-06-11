-- Create social_payment_submissions table
CREATE TABLE public.social_payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'linkedin', 'instagram', 'tiktok', 'telegram', 'facebook', 'discord', 'slack')),
  evidence_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_confidence DECIMAL(3,2),
  platform_detected TEXT,
  rejection_reasons TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_payment_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own submissions"
  ON public.social_payment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
  ON public.social_payment_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON public.social_payment_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all submissions"
  ON public.social_payment_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for user lookups
CREATE INDEX idx_social_payment_submissions_user_id ON public.social_payment_submissions(user_id);
CREATE INDEX idx_social_payment_submissions_status ON public.social_payment_submissions(status);

-- Create social-payments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('social-payments', 'social-payments', true);

-- Storage policies for social-payments bucket
CREATE POLICY "Authenticated users can upload social payment evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'social-payments' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view social payment evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-payments');

CREATE POLICY "Users can delete their own social payment evidence"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'social-payments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );