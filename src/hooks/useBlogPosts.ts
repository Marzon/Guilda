import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getAllArticles, getArticleBySlug, type BlogArticle } from '@/data/blog-articles';

// Extended type with SEO fields from DB
export interface BlogPostFromDB extends BlogArticle {
  id?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  schema_faq?: { question: string; answer: string }[] | null;
  noindex?: boolean | null;
  keyword_foco?: string | null;
  categoria?: string | null;
  cover_image_alt_text?: string | null;
}

/**
 * Adapter: converts a mkt_blog_posts row to the BlogArticle format used by the frontend
 */
function adaptDbPost(row: any): BlogPostFromDB {
  return {
    id: row.id,
    slug: row.slug,
    title: {
      pt: row.title_pt || '',
      en: row.title_en || '',
      es: row.title_es || '',
    },
    ogTitle: row.og_title ? { pt: row.og_title, en: row.og_title, es: row.og_title } : undefined,
    excerpt: {
      pt: row.excerpt_pt || '',
      en: row.excerpt_en || '',
      es: row.excerpt_es || '',
    },
    content: {
      pt: row.content_pt || '',
      en: row.content_en || '',
      es: row.content_es || '',
    },
    author: row.author || 'Equipe Guilda',
    publishedAt: row.published_at || row.created_at,
    readingTime: row.reading_time || 5,
    tags: row.tags || [],
    coverImage: row.cover_image || undefined,
    coverImageAlt: row.cover_image_alt
      ? { pt: row.cover_image_alt, en: row.cover_image_alt, es: row.cover_image_alt }
      : undefined,
    isHot: row.is_hot || false,
    faqData: Array.isArray(row.schema_faq) ? row.schema_faq : undefined,
    // SEO fields
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    canonical_url: row.canonical_url,
    og_title: row.og_title,
    og_description: row.og_description,
    og_image: row.og_image,
    schema_faq: Array.isArray(row.schema_faq) ? row.schema_faq : null,
    noindex: row.noindex,
    keyword_foco: row.keyword_foco,
    categoria: row.categoria,
    cover_image_alt_text: row.cover_image_alt,
  };
}

/**
 * Hook to fetch all published blog posts from the database.
 * Falls back to static articles if DB is empty or errors.
 */
export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts-public'],
    queryFn: async (): Promise<BlogPostFromDB[]> => {
      const { data, error } = await supabase
        .from('mkt_blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts from DB, using fallback:', error);
        return getAllArticles() as BlogPostFromDB[];
      }

      if (!data || data.length === 0) {
        console.log('No published posts in DB, using static fallback');
        return getAllArticles() as BlogPostFromDB[];
      }

      return data.map(adaptDbPost);
    },
    staleTime: 30 * 1000, // 30s cache
    refetchOnMount: 'always',
  });
}

/**
 * Hook to fetch a single blog post by slug.
 * Falls back to static article if not found in DB.
 */
export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog-post-public', slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogPostFromDB | null> => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('mkt_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching blog post from DB, using fallback:', error);
        const staticArticle = getArticleBySlug(slug);
        return staticArticle ? (staticArticle as BlogPostFromDB) : null;
      }

      if (!data) {
        // Try static fallback
        const staticArticle = getArticleBySlug(slug);
        return staticArticle ? (staticArticle as BlogPostFromDB) : null;
      }

      return adaptDbPost(data);
    },
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });
}
