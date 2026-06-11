
-- Add SEO fields to mkt_blog_posts
ALTER TABLE public.mkt_blog_posts
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS categoria TEXT,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS schema_faq JSONB,
  ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS keyword_foco TEXT;
