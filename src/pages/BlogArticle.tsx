import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isHubSlug, getHubBySlug } from "@/data/blog-hub-config";
import { lazy, Suspense } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";

const BlogHubPage = lazy(() => import("./BlogHub"));
import { 
  Calendar, Clock, ArrowLeft, ArrowRight, User, ChevronRight, ChevronDown,
  Linkedin, Twitter, MessageCircle, Link as LinkIcon, Rocket, 
  Wrench, Users, Swords, MoreVertical, Home, BookOpen, LogIn,
  Hammer, Megaphone, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getArticleBySlug, getAllArticles } from "@/data/blog-articles";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { InternalNavbar } from "@/components/InternalNavbar";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import DOMPurify from "dompurify";
import { getLocalizedPath } from "@/lib/localizedRoutes";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as 'pt' | 'en' | 'es';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  
  const { data: authData } = useAuth();
  const { logout } = useLogout();
  const isLoggedIn = !!authData?.user;

  const { data: article, isLoading: isLoadingPost } = useBlogPost(slug);
  const { data: allArticlesData = [] } = useBlogPosts();
  
  const relatedArticles = allArticlesData
    .filter(a => a.slug !== slug)
    .slice(0, 3);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? winScroll / height : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (article) {
      const content = article.content[lang] || article.content.en;
      const h2Matches = content.match(/^## .+$/gm) || [];
      const extractedHeadings = h2Matches.map((heading, index) => ({
        id: `heading-${index}`,
        text: heading.replace('## ', '')
      }));
      setHeadings(extractedHeadings);
    }
  }, [article, lang]);

  if (slug && isHubSlug(slug)) {
    const hub = getHubBySlug(slug)!;
    return (
      <Suspense fallback={<PageSkeleton />}>
        <BlogHubPage hub={hub} />
      </Suspense>
    );
  }

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-white">
        {isLoggedIn ? (
          <InternalNavbar userId={authData?.user?.id} username={authData?.profile?.username} avatarUrl={authData?.profile?.avatar_url} isPremium={authData?.subscription?.is_premium || false} onLogout={logout} showSearch={false} title="Blog" archetype={authData?.profile?.archetype} />
        ) : (
          <LandingDarkNavbar />
        )}
        <div className={`${isLoggedIn ? 'pt-20 sm:pt-24' : 'pt-24 sm:pt-32'} pb-12 md:pb-20`}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-10" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
        </div>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const content = article.content[lang] || article.content.en;
  const title = article.title[lang] || article.title.en;
  const excerpt = article.excerpt[lang] || article.excerpt.en;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(lang === 'pt' ? 'Link copiado!' : lang === 'es' ? '¡Enlace copiado!' : 'Link copied!');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + window.location.href)}`, '_blank');
  };

  const formatInlineMarkdown = (text: string) => {
    const html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="blog-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, (_, linkText, url) => {
        const sanitizedUrl = DOMPurify.sanitize(url, { ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i });
        const sanitizedText = DOMPurify.sanitize(linkText);
        return `<a href="${sanitizedUrl}" class="text-[#7610DC] hover:text-[#7610DC]/70 underline underline-offset-2" rel="noopener noreferrer">${sanitizedText}</a>`;
      });
    return DOMPurify.sanitize(html, { ADD_ATTR: ['class', 'rel'] });
  };

  let headingIndex = 0;
  
  const renderMarkdown = (md: string) => {
    headingIndex = 0;
    const blocks = md.split('\n\n');
    
    const mergedBlocks: string[] = [];
    let tableBuffer: string | null = null;

    for (const block of blocks) {
      const trimmed = block.trim();
      if (tableBuffer) {
        if (trimmed.startsWith('|')) {
          tableBuffer += '\n' + trimmed;
        } else {
          mergedBlocks.push(tableBuffer);
          tableBuffer = null;
          mergedBlocks.push(block);
        }
      } else if (trimmed.includes('|') && trimmed.includes('---')) {
        tableBuffer = trimmed;
      } else {
        mergedBlocks.push(block);
      }
    }
    if (tableBuffer) mergedBlocks.push(tableBuffer);

    const elements: React.ReactNode[] = [];
    
    mergedBlocks.forEach((block, index) => {
      if (block.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl md:text-4xl font-sans font-bold mb-6 mt-8 text-black"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.slice(2)) }}
          />
        );
        return;
      }
      if (block.startsWith('## ')) {
        const currentIndex = headingIndex++;
        elements.push(
          <h2 
            key={index} 
            id={`heading-${currentIndex}`}
            className="text-2xl font-sans font-bold mb-4 mt-10 text-black scroll-mt-24"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.slice(3)) }}
          />
        );
        return;
      }
      if (block.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-sans font-semibold mb-2 mt-6 text-gray-700"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.slice(4)) }}
          />
        );
        return;
      }

      if (block.trim() === '---') {
        elements.push(<hr key={index} className="my-12 border-black/10" />);
        return;
      }

      if (block.startsWith('- ') || block.includes('\n- ')) {
        const items = block.split('\n').filter(line => line.startsWith('- '));
        elements.push(
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-gray-500 pl-4">
            {items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item.slice(2)) }} />
            ))}
          </ul>
        );
        return;
      }

      if (/^\d+\.\s/.test(block.trim()) || block.includes('\n1.') || block.includes('\n2.')) {
        const items = block.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
        if (items.length > 0) {
          elements.push(
            <ol key={index} className="list-decimal list-inside space-y-2 mb-6 text-gray-500 pl-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item.replace(/^\d+\.\s/, '')) }} />
              ))}
            </ol>
          );
          return;
        }
      }

      if (block.includes('✅')) {
        const items = block.split('\n').filter(line => line.startsWith('✅'));
        elements.push(
          <ul key={index} className="space-y-2 mb-6">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500">✅</span>
                <span className="text-gray-500" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item.slice(2)) }} />
              </li>
            ))}
          </ul>
        );
        return;
      }

      if (block.includes('|') && block.includes('---')) {
        const rows = block.split('\n').filter(row => row.includes('|'));
        const headerRow = rows[0];
        const dataRows = rows.slice(2);

        const parseRow = (row: string) => 
          row.split('|').map(cell => cell.trim()).filter(Boolean);

        const headers = parseRow(headerRow);
        const guildaColIndex = headers.findIndex(h => h.toLowerCase().includes('guilda'));

        elements.push(
          <div key={index} className="relative mb-8">
            <div className="overflow-x-auto rounded-2xl border border-black/10">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-black/10">
                    {headers.map((cell, i) => (
                      <th 
                        key={i} 
                        className={`px-4 py-3 text-left text-sm font-bold text-black whitespace-nowrap ${
                          i === 0 ? 'sticky left-0 z-10 bg-gray-50' : ''
                        } ${i === guildaColIndex ? 'bg-[#7610DC]/5 border-l-2 border-r-2 border-[#7610DC]' : ''}`}
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, i) => {
                    const cells = parseRow(row);
                    return (
                      <tr key={i} className="border-b border-black/5 hover:bg-gray-50">
                        {cells.map((cell, j) => (
                          <td 
                            key={j} 
                            className={`px-4 py-3 text-sm text-gray-500 ${
                              j === 0 ? 'sticky left-0 z-10 bg-white font-medium text-black' : ''
                            } ${j === guildaColIndex ? 'bg-[#7610DC]/5 border-l-2 border-r-2 border-[#7610DC]/30' : ''}`}
                            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }}
                          />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center md:hidden">← {lang === 'pt' ? 'deslize para ver mais' : 'swipe to see more'} →</p>
          </div>
        );
        return;
      }

      elements.push(
        <p 
          key={index} 
          className="text-gray-500 leading-[1.75] mb-6 text-[16px] md:text-lg font-serif"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block) }}
        />
      );
    });
    
    return elements;
  };

  const post = article as any;
  const seoTitle = post.meta_title || title;
  const seoDescription = post.meta_description || excerpt;
  const seoOgTitle = post.og_title || post.meta_title || (article as any).ogTitle?.[lang] || title;
  const seoOgDescription = post.og_description || post.meta_description || excerpt;
  const seoOgImage = post.og_image || article.coverImage || "https://guilda.app.br/og-image.png";
  const seoCanonical = post.canonical_url || `https://guilda.app.br/blog/${slug}`;
  const seoNoindex = post.noindex === true;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": seoTitle,
    "description": seoDescription,
    "url": `https://guilda.app.br/blog/${slug}`,
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": { "@type": "Organization", "name": "Guilda", "url": "https://guilda.app.br" },
    "publisher": { "@type": "Organization", "name": "Guilda", "url": "https://guilda.app.br", "logo": { "@type": "ImageObject", "url": "https://guilda.app.br/og-image.png" } },
    "image": seoOgImage,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://guilda.app.br/blog/${slug}` },
    "keywords": article.tags?.join(", ") || ""
  };

  const faqData = article.faqData || (Array.isArray(post.schema_faq) ? post.schema_faq : null);
  const faqSchema = faqData && faqData.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  } : null;

  const categoryLabel = article.tags?.[0] || 'Article';

  const ShareButtons = ({ className = "", vertical = true }: { className?: string; vertical?: boolean }) => (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-3 items-center ${className}`}>
      <button 
        onClick={shareOnLinkedIn}
        className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#0077b5] hover:border-[#0077b5] flex items-center justify-center transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button 
        onClick={shareOnTwitter}
        className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2] flex items-center justify-center transition-colors"
        aria-label="Share on X"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button 
        onClick={shareOnWhatsApp}
        className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#25D366] hover:border-[#25D366] flex items-center justify-center transition-colors"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </button>
      <button 
        onClick={handleCopyLink}
        className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center transition-colors"
        title={lang === 'pt' ? 'Copiar Link' : 'Copy Link'}
        aria-label="Copy link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{seoTitle} | Guilda Academy</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoOgTitle} />
        <meta property="og:description" content={seoOgDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://guilda.app.br/blog/${slug}`} />
        <meta property="og:image" content={seoOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoOgTitle} />
        <meta name="twitter:description" content={seoOgDescription} />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:author" content={article.author} />
        {article.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={seoCanonical} />
        {seoNoindex && <meta name="robots" content="noindex,nofollow" />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {faqSchema && (
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        )}
      </Helmet>

      {/* Reading Progress Bar — flat, no gradient */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#7610DC] z-[100] origin-left"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <div className="min-h-screen bg-white text-black antialiased selection:bg-[#7610DC]/20">
        {/* Navbar */}
        {isLoggedIn ? (
          <InternalNavbar
            userId={authData?.user?.id}
            username={authData?.profile?.username}
            avatarUrl={authData?.profile?.avatar_url}
            isPremium={authData?.subscription?.is_premium || false}
            onLogout={logout}
            showSearch={false}
            title="Blog"
            archetype={authData?.profile?.archetype}
          />
        ) : (
          <LandingDarkNavbar />
        )}
        {!isLoggedIn && <SocialPaymentBanner />}

        {/* Article Header / Hero */}
        <header className={`${isLoggedIn ? 'pt-20 sm:pt-24' : 'pt-24 sm:pt-32'} pb-12 md:pb-20 border-b border-black/5`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/blog');
                  }
                }}
                className="text-gray-500 hover:text-[#7610DC] -ml-2 mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back', 'Voltar')}
              </Button>
            )}
            
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wide bg-[#7610DC]/10 text-[#7610DC]">
                <Rocket className="w-3 h-3 flex-shrink-0" />
                {categoryLabel}
              </span>
              
              <h1
                className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-8"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {title}
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
                {excerpt}
              </p>

              {/* Author Meta */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 border-t border-black/10 pt-8 max-w-lg mx-auto">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black/10">
                    <img src="/images/equipe-guilda-avatar-v2.png" alt={article.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">{article.author}</p>
                    <p className="text-xs text-gray-400">Guilda Team</p>
                  </div>
                </div>
                <div className="text-left border-l border-black/10 pl-6 md:pl-8">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                    {lang === 'pt' ? 'Publicado em' : lang === 'es' ? 'Publicado en' : 'Published'}
                  </p>
                  <p className="text-sm text-black font-medium">{formatDate(article.publishedAt)}</p>
                </div>
                <div className="text-left border-l border-black/10 pl-6 md:pl-8 hidden sm:block">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                    {lang === 'pt' ? 'Tempo de Leitura' : lang === 'es' ? 'Tiempo de Lectura' : 'Read Time'}
                  </p>
                  <p className="text-sm text-black font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" /> {article.readingTime} min
                  </p>
                </div>
              </div>

              {/* Mobile/Tablet share bar */}
              <div className="lg:hidden mt-6 pt-4 border-t border-black/10">
                <ShareButtons vertical={false} />
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.coverImage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 mb-16 relative z-10">
            <div className="rounded-2xl lg:rounded-[2rem] overflow-hidden border border-black/10">
              <img 
                src={article.coverImage} 
                alt={(article as any).coverImageAlt?.[lang] || title} 
                className="w-full h-auto max-w-full object-cover"
                style={{ maxHeight: '500px' }}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Sidebar: Social Share (Sticky) - desktop only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32 flex flex-col gap-4 items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest rotate-180 [writing-mode:vertical-rl] py-4">
                  {lang === 'pt' ? 'Compartilhar' : lang === 'es' ? 'Compartir' : 'Share'}
                </p>
                <ShareButtons vertical={true} />
              </div>
            </div>

            {/* Center Column: The Content */}
            <article className="col-span-1 lg:col-span-8 max-w-none">
              {/* Lead Quote */}
              <p className="text-xl md:text-2xl font-serif text-gray-500 italic border-l-4 border-[#7610DC] pl-6 mb-12">
                {excerpt}
              </p>

              {/* Collapsible Table of Contents - mobile/tablet */}
              {headings.length > 0 && (
                <div className="lg:hidden mb-8 border border-black/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setTocOpen(!tocOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 text-sm font-bold text-black hover:bg-gray-100 transition-colors"
                  >
                    <span>{lang === 'pt' ? '📖 Sumário do Artigo' : lang === 'es' ? '📖 Índice del Artículo' : '📖 Table of Contents'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {tocOpen && (
                    <ul className="px-5 py-4 space-y-3 text-sm">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a 
                            href={`#${heading.id}`}
                            onClick={() => setTocOpen(false)}
                            className="text-gray-500 hover:text-[#7610DC] transition-colors block"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:mx-auto">
                {renderMarkdown(content)}
              </div>

              {/* FAQ Section as Accordion */}
              {faqData && faqData.length > 0 && (
                <div className="mt-12" itemScope itemType="https://schema.org/FAQPage">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    {lang === 'pt' ? 'Perguntas Frequentes' : lang === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
                  </h2>
                  <Accordion type="multiple" className="space-y-3">
                    {faqData.map((faq: any, i: number) => (
                      <AccordionItem 
                        key={i} 
                        value={`faq-${i}`}
                        className="border border-black/10 rounded-2xl px-5 bg-white data-[state=open]:border-[#7610DC]/30"
                        itemScope 
                        itemProp="mainEntity" 
                        itemType="https://schema.org/Question"
                      >
                        <AccordionTrigger className="text-left text-black font-semibold hover:text-[#7610DC] text-base">
                          <span itemProp="name">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent 
                          className="text-gray-500 leading-relaxed"
                          itemScope 
                          itemProp="acceptedAnswer" 
                          itemType="https://schema.org/Answer"
                        >
                          <span itemProp="text">{faq.answer}</span>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Author Box */}
              <div className="mt-12 bg-[#7610DC]/5 p-6 rounded-2xl border border-[#7610DC]/10 flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-black/10 flex-shrink-0">
                  <img src="/images/equipe-guilda-avatar-v2.png" alt={article.author} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold text-black font-sans m-0">
                    {lang === 'pt' ? 'Sobre o Autor' : lang === 'es' ? 'Sobre el Autor' : 'About the Author'}
                  </h4>
                  <p className="text-sm text-gray-500 m-0 mt-2 leading-relaxed">
                    <strong className="text-black">{article.author}</strong> {lang === 'pt' ? 'faz parte da equipe de conteúdo da Guilda, ajudando fundadores a encontrarem seus co-fundadores ideais.' : lang === 'es' ? 'es parte del equipo de contenido de Guilda, ayudando a fundadores a encontrar sus co-fundadores ideales.' : 'is part of the Guilda content team, helping founders find their ideal co-founders.'}
                  </p>
                  <div className="flex gap-4 mt-3 justify-center sm:justify-start">
                    <Link to="/tavern" className="text-[#7610DC] text-sm font-bold hover:underline">
                      {lang === 'pt' ? 'Ver Perfis na Guilda' : lang === 'es' ? 'Ver Perfiles en Guilda' : 'View Profiles at Guilda'}
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* Right Sidebar: Table of Contents & Sticky CTA */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {lang === 'pt' ? 'Neste Artigo' : lang === 'es' ? 'En Este Artículo' : 'In This Article'}
                    </h4>
                    <ul className="space-y-3 text-sm border-l-2 border-black/10 pl-4">
                      {headings.map((heading, index) => (
                        <li key={heading.id}>
                          <a 
                            href={`#${heading.id}`}
                            className={`text-gray-500 hover:text-[#7610DC] transition-colors block ${index === 0 ? 'text-black font-medium border-l-2 border-[#7610DC] -ml-[18px] pl-4' : ''}`}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Side CTA Widget — flat, no shadow, no gradient */}
                <div className="bg-white rounded-2xl border border-black/10 p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#7610DC]" />
                  
                  <div className="w-12 h-12 bg-[#7610DC]/10 text-[#7610DC] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-black mb-2">
                    {lang === 'pt' ? 'Pronto para começar?' : lang === 'es' ? '¿Listo para empezar?' : 'Ready to start?'}
                  </h4>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    {lang === 'pt' 
                      ? 'Encontre Builders e Sellers na Guilda para transformar sua ideia em realidade.'
                      : lang === 'es'
                      ? 'Encuentra Builders y Sellers en Guilda para transformar tu idea en realidad.'
                      : 'Find Builders and Sellers at Guilda to transform your idea into reality.'}
                  </p>
                  <Link to="/auth?view=signup">
                    <Button className="w-full bg-[#7610DC] hover:bg-[#7610DC]/90 text-white text-xs font-bold py-3 rounded-xl transition-colors">
                      {lang === 'pt' ? 'Encontrar Co-Founder' : lang === 'es' ? 'Encontrar Co-Fundador' : 'Find Co-Founder'}
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-black/5 py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h3
                className="text-[1.75rem] sm:text-3xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-8"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {lang === 'pt' ? 'Continue aprendendo' : lang === 'es' ? 'Sigue aprendiendo' : 'Keep learning'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {relatedArticles.map((related) => {
                  const relatedTitle = related.title[lang] || related.title.en;
                  const relatedTag = related.tags[0] || 'Article';
                  
                  return (
                    <Link key={related.slug} to={`/blog/${related.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-black/10 hover:border-[#7610DC]/30 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      <div className="aspect-video bg-gray-50 overflow-hidden">
                        {related.coverImage ? (
                          <img 
                            src={related.coverImage} 
                            alt={relatedTitle}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#7610DC]/10" />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold text-[#7610DC] mb-2 uppercase">{relatedTag}</p>
                        <h4 className="text-base font-bold text-black group-hover:text-[#7610DC] transition-colors line-clamp-2">
                          {relatedTitle}
                        </h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <LandingFooter />
      </div>
    </>
  );
};

export default BlogArticle;
