import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Wrench, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { InternalNavbar } from "@/components/InternalNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { useSubscription } from "@/hooks/useSubscription";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";
import { BlogHub as BlogHubType, blogHubs } from "@/data/blog-hub-config";
import { getArticleBySlug } from "@/data/blog-articles";

interface BlogHubProps {
  hub: BlogHubType;
}

const BlogHub = ({ hub }: BlogHubProps) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "pt" | "en" | "es";
  const { data: authData } = useAuth();
  const { logout } = useLogout();
  const user = authData?.user;
  const profile = authData?.profile;
  const { isPremium } = useSubscription(user?.id || null);
  const isLoggedIn = !!user;

  const title = hub.title[lang] || hub.title.en;
  const description = hub.description[lang] || hub.description.en;
  const introText = hub.introText[lang] || hub.introText.en;
  const ctaLabel = hub.ctaLabel[lang] || hub.ctaLabel.en;
  const Icon = hub.icon;

  const childArticles = hub.childSlugs
    .map(slug => getArticleBySlug(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof getArticleBySlug>>[];

  const otherHubs = blogHubs.filter(h => h.slug !== hub.slug);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `https://www.guilda.app.br/blog/${hub.slug}`,
    publisher: { "@type": "Organization", name: "Guilda", url: "https://www.guilda.app.br" },
    hasPart: childArticles.map(article => ({
      "@type": "Article",
      headline: article.title[lang] || article.title.en,
      url: `https://www.guilda.app.br/blog/${article.slug}`,
      datePublished: article.publishedAt,
    })),
  };

  return (
    <>
      <Helmet>
        <title>{title} | Guilda Academy</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | Guilda Academy`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://www.guilda.app.br/blog/${hub.slug}`} />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
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

        {/* Hero Section */}
        <header className={`${isLoggedIn ? "pt-20 sm:pt-24" : "pt-24 sm:pt-32"} pb-12 sm:pb-16 border-b border-black/5`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-6">
              <Link to="/blog" className="hover:text-[#7610DC]">Blog</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-[#7610DC]">{hub.slug}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#7610DC]/10 p-2.5 rounded-xl">
                <Icon className="w-6 h-6 text-[#7610DC]" />
              </div>
              <span className="text-[#7610DC] font-bold text-sm uppercase tracking-wider">
                {t("blogHub.pillarPage", "Pillar Page")}
              </span>
            </div>

            <h1
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-3xl">
              {description}
            </p>

            <Link to={hub.ctaLink}>
              <Button size="lg" className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white font-bold rounded-xl">
                {ctaLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Intro Text */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-lg text-gray-500 leading-relaxed font-serif">
            {introText}
          </p>
        </section>

        {/* Articles Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <h2 className="text-2xl font-bold text-black mb-8 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7610DC] flex-shrink-0" />
            {t("blogHub.relatedArticles", "Artigos relacionados")}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({childArticles.length})
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {childArticles.map(article => (
              <Link key={article.slug} to={`/blog/${article.slug}`}>
                <article className="group cursor-pointer flex flex-col h-full">
                  <div className="relative overflow-hidden rounded-2xl mb-4 h-44 sm:h-52 bg-gray-50 border border-black/5">
                    <img
                      src={article.coverImage || "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80"}
                      alt={article.title[lang] || article.title.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-xs font-bold text-[#7610DC] uppercase tracking-wider mb-2">
                      {article.tags[0]}
                    </p>
                    <h3 className="text-lg font-bold text-black mb-2 group-hover:text-[#7610DC] transition-colors line-clamp-2">
                      {article.title[lang] || article.title.en}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                      {article.excerpt[lang] || article.excerpt.en}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{article.readingTime} min</span>
                      <span>·</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Banner — flat, no gradient */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="bg-[#7610DC] rounded-2xl lg:rounded-[2rem] p-8 sm:p-12">
            <div className="max-w-xl">
              <h3
                className="text-2xl sm:text-3xl font-serif font-thin leading-[0.9] tracking-tight text-white mb-4"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t("blogHub.ctaBannerTitle", "Pronto para o próximo passo?")}
              </h3>
              <p className="text-white/80 mb-6 text-lg">
                {t("blogHub.ctaBannerDescription", "Pare de apenas ler sobre — comece a construir sua startup com o suporte certo.")}
              </p>
              <Link to={hub.ctaLink}>
                <Button size="lg" className="bg-white text-[#7610DC] hover:bg-gray-50 font-bold rounded-xl">
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        {hub.relatedTools.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#7610DC] flex-shrink-0" />
              {t("blogHub.recommendedTools", "Ferramentas recomendadas")}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hub.relatedTools.map(tool => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="group border border-black/10 rounded-2xl p-5 hover:border-[#7610DC]/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black group-hover:text-[#7610DC] transition-colors">
                      {tool.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#7610DC] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Explore Also */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <h2 className="text-2xl font-bold text-black mb-6">
            {t("blogHub.exploreAlso", "Explore também")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherHubs.map(h => {
              const HubIcon = h.icon;
              return (
                <Link
                  key={h.slug}
                  to={`/blog/${h.slug}`}
                  className="group border border-black/10 rounded-2xl p-5 hover:border-[#7610DC]/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#7610DC]/10 p-2 rounded-xl">
                      <HubIcon className="w-4 h-4 text-[#7610DC]" />
                    </div>
                    <span className="font-semibold text-black group-hover:text-[#7610DC] transition-colors text-sm">
                      {h.title[lang] || h.title.en}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {h.description[lang] || h.description.en}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};

export default BlogHub;
