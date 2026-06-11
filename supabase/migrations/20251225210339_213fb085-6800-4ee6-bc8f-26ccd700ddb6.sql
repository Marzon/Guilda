-- Create table to store which books users have read
CREATE TABLE public.user_book_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id INTEGER NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_book_reads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own book reads
CREATE POLICY "Users can view their own book reads"
ON public.user_book_reads
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own book reads
CREATE POLICY "Users can insert their own book reads"
ON public.user_book_reads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own book reads
CREATE POLICY "Users can delete their own book reads"
ON public.user_book_reads
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_book_reads_user_id ON public.user_book_reads(user_id);