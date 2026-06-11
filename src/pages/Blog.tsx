import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, ArrowRight, Search, X, Users } from "lucide-react";
import { blogHubs } from "@/data/blog-hub-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { getAllTags } from "@/data/blog-articles";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { useSubscription } from "@/hooks/useSubscription";
import { InternalNavbar } from "@/components/InternalNavbar";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";

const Blog = () => {
  const { t, i18n } = useTranslation();
  const { data: stats } = usePlatformStats();
  const { data: authData } = useAuth();
  const { logout } = useLogout();
  const user = authData?.user;
  const profile = authData?.profile;
  const { isPremium } = useSubscription(user?.id || null);
  const isLoggedIn = !!user;
  
  const { data: allArticles = [], isLoading: isLoadingPosts } = useBlogPosts();
  const allTags = getAllTags();
  const lang = i18n.language as 'pt' | 'en' | 'es';

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredArticles = useMemo(() => {
    return allArticles.filter(article => {
      const matchesSearch = searchQuery === "" || 
        article.title[lang]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt[lang]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = !selectedTag || article.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
      return matchesSearch && matchesTag;
    });
  }, [allArticles, searchQuery, selectedTag, lang]);

  const featuredArticle = allArticles[0];
  const remainingArticles = filteredArticles.filter(a => a.slug !== featuredArticle?.slug);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const clearFilters = () => { setSearchQuery(""); setSelectedTag(null); setVisibleCount(6); };
  const loadMore = () => { setVisibleCount(prev => prev + 6); };
  const hasActiveFilters = searchQuery !== "" || selectedTag !== null;

  const getHeaderPadding = () => isLoggedIn ? 'pt-20 sm:pt-24' : 'pt-24 sm:pt-32';

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": t('blog.pageTitle'),
    "description": t('blog.pageDescription'),
    "url": "https://guilda.app.br/blog",
    "publisher": { "@type": "Organization", "name": "Guilda", "url": "https://guilda.app.br", "logo": { "@type": "ImageObject", "url": "https://guilda.app.br/og-image.png" } },
    "blogPost": filteredArticles.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title[lang] || article.title.en,
      "description": article.excerpt[lang] || article.excerpt.en,
      "url": `https://guilda.app.br/blog/${article.slug}`,
      "datePublished": article.publishedAt,
      "author": { "@type": "Organization", "name": "Guilda" }
    }))
  };

  return (
    <>
      <Helmet>
        <title>{t('blog.pageTitle')} | Guilda</title>
        <meta name="description" content={t('blog.pageDescription')} />
        <link rel="canonical" href="https://www.guilda.app.br/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.guilda.app.br/blog" />
        <meta property="og:title" content={`${t('blog.pageTitle')} | Guilda`} />
        <meta property="og:description" content={t('blog.pageDescription')} />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <meta property="og:site_name" content="Guilda" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('blog.pageTitle')} | Guilda`} />
        <meta name="twitter:description" content={t('blog.pageDescription')} />
        <meta name="twitter:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-white text-black antialiased selection:bg-[#7610DC]/20">
        {isLoggedIn && profile ? (
          <InternalNavbar 
            username={profile.username}
            avatarUrl={profile.avatar_url}
            isPremium={isPremium}
            onLogout={logout}
            archetype={profile.archetype}
          />
        ) : (
          <LandingDarkNavbar />
        )}
        <SocialPaymentBanner />

        {/* Hero */}
        <header className={`${getHeaderPadding()} pb-12 sm:pb-16 border-b border-black/5`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 sm:mb-12">
              <div>
                <p className="text-[#7610DC] font-medium text-sm uppercase tracking-wider mb-2">Guilda Academy</p>
                <h1
                  className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  {t('blog.heroTitle', 'Conhecimento tático para')}{' '}
                  <span className="text-[#7610DC]">Zero to One.</span>
                </h1>
              </div>
              
              <div className="hidden lg:block">
                <p className="text-sm text-gray-500 mb-2">
                  {t('blog.ctaText', 'Pronto para encontrar seu co-founder?')}
                </p>
                <Link to="/auth?view=signup">
                  <Button className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl">
                    {t('blog.ctaButton', 'Cadastre-se Grátis')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Featured Post */}
            {featuredArticle && (
              <Link to={`/blog/${featuredArticle.slug}`}>
                <div className="group cursor-pointer rounded-2xl lg:rounded-[2rem] overflow-hidden border border-black/10 relative">
                  <img 
                    src={featuredArticle.coverImage || "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"} 
                    alt={featuredArticle.title[lang] || featuredArticle.title.en}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-12 z-20 max-w-3xl">
                    <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
                      <span className="bg-[#7610DC] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {t('blog.mustRead', 'Must Read')}
                      </span>
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {featuredArticle.readingTime} min {t('blog.readTime', 'de leitura')}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {featuredArticle.title[lang] || featuredArticle.title.en}
                    </h2>
                    <p className="text-sm sm:text-lg text-white/80 mb-4 sm:mb-6 line-clamp-2 hidden sm:block">
                      {featuredArticle.excerpt[lang] || featuredArticle.excerpt.en}
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img 
                        src="/images/equipe-guilda-avatar-v2.png" 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover"
                        alt={featuredArticle.author}
                      />
                      <div>
                        <p className="text-white font-bold text-sm">{featuredArticle.author}</p>
                        <p className="text-white/60 text-xs">{formatDate(featuredArticle.publishedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </header>

        {/* Hub Navigation */}
        <div className="sticky top-12 sm:top-14 z-40 bg-white border-b border-black/5 py-3 sm:py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 pb-1">
              <button
                onClick={() => { setSelectedTag(null); setSearchQuery(""); }}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedTag
                    ? 'bg-[#7610DC] text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-[#7610DC]/30 hover:text-[#7610DC]'
                }`}
              >
                🔥 {t('blog.hotTopics', 'Hot Topics')}
              </button>

              {blogHubs.map((hub) => {
                const HubIcon = hub.icon;
                const hubTitle = hub.slug === 'cofundador' ? (lang === 'pt' ? 'Cofundador' : lang === 'es' ? 'Cofundador' : 'Co-Founder')
                  : hub.slug === 'mvp' ? (lang === 'pt' ? 'MVP & Produto' : lang === 'es' ? 'MVP & Producto' : 'MVP & Product')
                  : hub.slug === 'time-startup' ? (lang === 'pt' ? 'Time & Cultura' : lang === 'es' ? 'Equipo & Cultura' : 'Team & Culture')
                  : hub.slug === 'aceleracao' ? (lang === 'pt' ? 'Growth Hacking' : lang === 'es' ? 'Growth Hacking' : 'Growth Hacking')
                  : hub.slug === 'fundraising' ? 'Fundraising'
                  : hub.title[lang] || hub.title.en;
                return (
                  <Link
                    key={hub.slug}
                    to={`/blog/${hub.slug}`}
                    className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors bg-white border border-gray-200 text-gray-500 hover:border-[#7610DC]/30 hover:text-[#7610DC] flex items-center gap-1.5"
                  >
                    <HubIcon className="w-3.5 h-3.5" />
                    {hubTitle}
                  </Link>
                );
              })}

              <div className="relative ml-auto hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('blog.searchPlaceholder', 'Buscar artigos...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8 h-9 w-48 bg-white border-gray-200 text-sm rounded-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 py-4 bg-white border-b border-black/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('blog.searchPlaceholder', 'Buscar artigos...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 bg-white border-gray-200 rounded-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {filteredArticles.length} {filteredArticles.length === 1 ? t('blog.articleFound') : t('blog.articlesFound')}
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500 hover:text-black">
                <X className="h-3 w-3 mr-1" />
                {t('blog.clearFilters')}
              </Button>
            </div>
          </div>
        )}

        {/* Articles Feed */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {isLoadingPosts ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col h-full">
                  <Skeleton className="rounded-2xl mb-4 h-44 sm:h-52" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-8 w-32 mt-auto" />
                </div>
              ))}
            </div>
          ) : remainingArticles.length === 0 && hasActiveFilters ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">{t('blog.noResults')}</p>
              <Button variant="outline" onClick={clearFilters} className="border-gray-200 text-black hover:bg-gray-50 rounded-xl">
                {t('blog.clearFilters')}
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {remainingArticles.slice(0, Math.min(3, visibleCount)).map((article) => (
                <ArticleCard key={article.slug} article={article} lang={lang} formatDate={formatDate} />
              ))}

              {/* Guilda CTA Widget */}
              {remainingArticles.length > 2 && (
                <div className="md:col-span-2 lg:col-span-3 my-4 sm:my-8">
                  <div className="bg-[#7610DC] rounded-2xl lg:rounded-[2rem] p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                    <div className="max-w-xl text-center md:text-left">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                        {t('blog.guildaCTATitle', 'Venha para a Guilda')}
                      </h3>
                      <p className="text-white/80 mb-4 sm:mb-6 text-base sm:text-lg">
                        {t('blog.guildaCTADescription', 'Conecte-se com co-founders que complementam suas habilidades. Builders encontram Sellers, e vice-versa.')}
                      </p>
                      <Link to="/auth?view=signup">
                        <Button size="lg" className="bg-white text-[#7610DC] hover:bg-gray-50 font-bold rounded-xl">
                          {t('blog.guildaCTAButton', 'Cadastre-se Grátis')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-3 border border-white/20 rounded-2xl px-6 py-4">
                      <Users className="w-8 h-8 text-white flex-shrink-0" />
                      <div>
                        <p className="text-3xl font-bold text-white">{stats?.total_profiles || '800'}+</p>
                        <p className="text-white/70 text-sm">{t('blog.statsMembers', 'Membros ativos')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {remainingArticles.slice(3, visibleCount).map((article) => (
                <ArticleCard key={article.slug} article={article} lang={lang} formatDate={formatDate} />
              ))}
            </div>
          )}

          {remainingArticles.length > visibleCount && (
            <div className="mt-12 sm:mt-16 text-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={loadMore}
                className="border-gray-200 text-black hover:bg-gray-50 hover:border-[#7610DC]/30 rounded-xl"
              >
                {t('blog.loadMore', 'Carregar mais artigos')} ({remainingArticles.length - visibleCount} restantes)
              </Button>
            </div>
          )}
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

// Article Card Component
interface ArticleCardProps {
  article: any;
  lang: 'pt' | 'en' | 'es';
  formatDate: (date: string) => string;
}

const ArticleCard = ({ article, lang, formatDate }: ArticleCardProps) => {
  const primaryTag = article.tags[0];

  return (
    <Link to={`/blog/${article.slug}`}>
      <article className="group cursor-pointer flex flex-col h-full">
        <div className="relative overflow-hidden rounded-2xl mb-4 h-44 sm:h-52 bg-gray-50 border border-black/5">
          <img 
            src={article.coverImage || `https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80`}
            alt={article.title[lang] || article.title.en}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {article.isHot && (
            <span className="absolute top-3 left-3 bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full">
              🔥 Hot Topic
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-bold uppercase text-[#7610DC]">
            {primaryTag}
          </span>
          <span className="text-xs text-gray-400">• {article.readingTime} min</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3 leading-tight transition-colors group-hover:text-[#7610DC]">
          {article.title[lang] || article.title.en}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {article.excerpt[lang] || article.excerpt.en}
        </p>
        <div className="flex items-center gap-3 mt-auto pt-3 sm:pt-4 border-t border-black/5">
          <img 
            src="/images/equipe-guilda-avatar-v2.png"
            alt={article.author}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs font-medium text-gray-500">{article.author}</span>
        </div>
      </article>
    </Link>
  );
};

export default Blog;
