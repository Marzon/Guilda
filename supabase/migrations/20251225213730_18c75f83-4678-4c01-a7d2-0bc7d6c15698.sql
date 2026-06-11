-- Create book_covers table for caching generated covers
CREATE TABLE public.book_covers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn TEXT UNIQUE NOT NULL,
  cover_url TEXT NOT NULL,
  category TEXT,
  stage TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.book_covers ENABLE ROW LEVEL SECURITY;

-- Public read access (covers are public)
CREATE POLICY "Anyone can view book covers"
ON public.book_covers
FOR SELECT
USING (true);

-- Only edge functions (service role) can insert/update
CREATE POLICY "Service role can manage book covers"
ON public.book_covers
FOR ALL
USING (auth.role() = 'service_role');

-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for book-covers bucket
CREATE POLICY "Anyone can view book covers storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'book-covers');

CREATE POLICY "Service role can upload book covers"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "Service role can update book covers"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'book-covers');

CREATE POLICY "Service role can delete book covers"
ON storage.objects
FOR DELETE
USING (bucket_id = 'book-covers');