-- Create public bucket for quiz report PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-reports', 'quiz-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to quiz-reports bucket
CREATE POLICY "Quiz reports are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'quiz-reports');
