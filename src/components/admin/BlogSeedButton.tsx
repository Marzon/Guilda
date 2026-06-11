import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { blogArticles } from '@/data/blog-articles';
import { sellerToolsArticles } from '@/data/seller-tools-articles';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function BlogSeedButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState('');

  const syncArticles = async () => {
    setIsSyncing(true);
    const allArticles = [...blogArticles, ...sellerToolsArticles];
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Get existing slugs first
    const { data: existing } = await supabase
      .from('mkt_blog_posts')
      .select('slug');
    
    const existingSlugs = new Set(existing?.map(p => p.slug) || []);
    const preExistingCount = existingSlugs.size;

    for (let i = 0; i < allArticles.length; i++) {
      const article = allArticles[i];
      setProgress(`${i + 1}/${allArticles.length} — ${article.slug}`);

      // Skip if slug already exists
      if (existingSlugs.has(article.slug)) {
        skipped++;
        continue;
      }

      const payload = {
        slug: article.slug,
        title_pt: article.title.pt,
        title_en: article.title.en,
        title_es: article.title.es,
        content_pt: article.content.pt,
        content_en: article.content.en || null,
        content_es: article.content.es || null,
        excerpt_pt: article.excerpt.pt,
        excerpt_en: article.excerpt.en || null,
        excerpt_es: article.excerpt.es || null,
        author: article.author || 'Equipe Guilda',
        published_at: article.publishedAt,
        reading_time: article.readingTime,
        tags: article.tags,
        cover_image: article.coverImage || null,
        cover_image_alt: article.coverImageAlt?.pt || null,
        is_hot: article.isHot || false,
        is_published: true,
        schema_faq: article.faqData && article.faqData.length > 0 ? article.faqData : null,
        og_title: (article as any).ogTitle?.pt || null,
      };

      const { error } = await supabase
        .from('mkt_blog_posts')
        .insert(payload as any);

      if (error) {
        console.error(`Error inserting ${article.slug}:`, error);
        errors++;
      } else {
        inserted++;
      }
    }

    const totalInDb = preExistingCount + inserted;
    setProgress(`✅ Concluído: ${inserted} inseridos, ${skipped} ignorados (já existiam), ${errors} erros. Total no banco: ${totalInDb}`);
    
    if (errors === 0) {
      toast.success(`Sincronização concluída: ${inserted} artigos inseridos`);
    } else {
      toast.warning(`Sincronização concluída com ${errors} erros. Verifique o console.`);
    }

    setIsSyncing(false);
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={syncArticles}
        disabled={isSyncing}
        className="gap-2"
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : progress.startsWith('✅') ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Sincronizar Artigos Estáticos
      </Button>
      {progress && (
        <p className="text-xs text-muted-foreground">{progress}</p>
      )}
    </div>
  );
}
