-- =============================================
-- MARKETING ADMIN CONSOLE - DATABASE SCHEMA
-- =============================================

-- 1. Blog Posts Table
CREATE TABLE public.mkt_blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  excerpt_pt TEXT,
  excerpt_en TEXT,
  excerpt_es TEXT,
  content_pt TEXT NOT NULL,
  content_en TEXT,
  content_es TEXT,
  author TEXT NOT NULL DEFAULT 'Guilda',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER DEFAULT 5,
  is_hot BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- 2. SEO Configs Table
CREATE TABLE public.mkt_seo_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  title_pt TEXT,
  title_en TEXT,
  title_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  keywords TEXT[] DEFAULT '{}',
  og_image TEXT,
  canonical_url TEXT,
  no_index BOOLEAN DEFAULT false,
  schema_json JSONB,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 3. Sitemap Entries Table
CREATE TABLE public.mkt_sitemap_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  changefreq TEXT DEFAULT 'weekly' CHECK (changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  priority NUMERIC(2,1) DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
  last_modified DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Tracking Scripts Table
CREATE TABLE public.mkt_tracking_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('analytics', 'pixel', 'custom')),
  script_head TEXT,
  script_body TEXT,
  is_active BOOLEAN DEFAULT true,
  load_priority INTEGER DEFAULT 10,
  pages TEXT[] DEFAULT '{}',
  exclude_pages TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.mkt_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mkt_seo_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mkt_sitemap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mkt_tracking_scripts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Using has_role RPC from Core App
-- =============================================

-- Blog Posts: Public read published, Admin full access
CREATE POLICY "Public can read published blog posts" 
ON public.mkt_blog_posts 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can do everything on blog posts" 
ON public.mkt_blog_posts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- SEO Configs: Public read, Admin write
CREATE POLICY "Public can read SEO configs" 
ON public.mkt_seo_configs 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can do everything on SEO configs" 
ON public.mkt_seo_configs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Sitemap Entries: Public read active, Admin full access
CREATE POLICY "Public can read active sitemap entries" 
ON public.mkt_sitemap_entries 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can do everything on sitemap entries" 
ON public.mkt_sitemap_entries 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Tracking Scripts: Public read active, Admin full access
CREATE POLICY "Public can read active tracking scripts" 
ON public.mkt_tracking_scripts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can do everything on tracking scripts" 
ON public.mkt_tracking_scripts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_mkt_blog_posts_updated_at
BEFORE UPDATE ON public.mkt_blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mkt_seo_configs_updated_at
BEFORE UPDATE ON public.mkt_seo_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mkt_tracking_scripts_updated_at
BEFORE UPDATE ON public.mkt_tracking_scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_mkt_blog_posts_slug ON public.mkt_blog_posts(slug);
CREATE INDEX idx_mkt_blog_posts_published ON public.mkt_blog_posts(is_published, published_at DESC);
CREATE INDEX idx_mkt_blog_posts_tags ON public.mkt_blog_posts USING GIN(tags);
CREATE INDEX idx_mkt_seo_configs_path ON public.mkt_seo_configs(page_path);
CREATE INDEX idx_mkt_sitemap_entries_active ON public.mkt_sitemap_entries(is_active);
CREATE INDEX idx_mkt_tracking_scripts_active ON public.mkt_tracking_scripts(is_active, load_priority);