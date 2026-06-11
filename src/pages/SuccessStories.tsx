import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Trophy, Users, Rocket, MessageSquare, Filter, Heart, 
  Sparkles, Globe, Target, Zap, Award, Quote
} from "lucide-react";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SuccessStoryCard, SuccessStoryDetail } from "@/components/success";
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel";
import { useSuccessStories, type SuccessStory } from "@/hooks/useSuccessStories";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PARTNERSHIP_TYPES = ['cofounder', 'contractor', 'advisor', 'investor', 'other'] as const;

const HIGHLIGHT_QUOTES = [
  "LinkedIn voltado a founders. Direto, rápido, sem disneyland.",
  "Conhecer pessoas antenadas! Volto aqui todos os dias.",
  "Encontrar pessoas com perfil empreendedor.",
  "Melhorou muito o dia a dia.",
];

export default function SuccessStories() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const { publicStories, isLoadingPublic, featuredStories } = useSuccessStories();
  const { data: stats, isLoading: isLoadingStats } = usePlatformStats();
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

  useEffect(() => {
    if (highlightId && publicStories.length > 0) {
      const story = publicStories.find(s => s.id === highlightId);
      if (story) setSelectedStory(story);
    }
  }, [highlightId, publicStories]);

  const filteredStories = useMemo(() => {
    if (!selectedType) return publicStories;
    return publicStories.filter(s => s.partnership_type === selectedType);
  }, [publicStories, selectedType]);

  const getPartnershipLabel = (type: string) => {
    switch (type) {
      case 'cofounder': return t('successStoriesPage.partnershipTypes.cofounder', 'Co-fundadores');
      case 'contractor': return t('successStoriesPage.partnershipTypes.contractor', 'Contratação');
      case 'advisor': return t('successStoriesPage.partnershipTypes.advisor', 'Advisor');
      case 'investor': return t('successStoriesPage.partnershipTypes.investor', 'Investidor');
      case 'other': return t('successStoriesPage.partnershipTypes.other', 'Parceria');
      default: return type;
    }
  };

  const canonicalUrl = `https://www.guilda.app.br/success-stories`;

  return (
    <>
      <Helmet>
        <title>{t('successStoriesPage.title', 'Histórias de Sucesso')} | Guilda</title>
        <meta name="description" content={t('successStoriesPage.description', 'Conheça fundadores que encontraram co-fundadores e parceiros através da Guilda')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${t('successStoriesPage.title', 'Histórias de Sucesso')} | Guilda`} />
        <meta property="og:description" content={t('successStoriesPage.description', 'Conheça fundadores que encontraram co-fundadores e parceiros através da Guilda')} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": t('successStoriesPage.title', 'Histórias de Sucesso'),
            "description": t('successStoriesPage.description', 'Conheça fundadores que encontraram co-fundadores e parceiros através da Guilda'),
            "url": canonicalUrl,
            "publisher": {
              "@type": "Organization",
              "name": "Guilda",
              "url": "https://www.guilda.app.br"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingDarkNavbar />

        {/* Hero */}
        <header className="pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1
              className="text-[1.75rem] sm:text-4xl md:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t('successStoriesPage.heroTitle', 'Onde Fundadores Se Encontram')}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('successStoriesPage.heroSubtitle', 'A Guilda nasceu para resolver um problema real: conectar fundadores complementares que juntos podem construir algo extraordinário. Conheça as histórias de quem já encontrou seu match perfeito.')}
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4 text-[#7610dc]" />
                <span><strong className="text-black">{stats?.total_profiles || 0}+</strong> fundadores ativos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Heart className="h-4 w-4 text-[#7610dc]" />
                <span><strong className="text-black">{stats?.total_matches || 0}+</strong> conexões feitas</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Rocket className="h-4 w-4 text-[#7610dc]" />
                <span><strong className="text-black">{stats?.total_projects || 0}+</strong> projetos nascendo</span>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <section className="py-12 border-y border-black/5">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">
                {t('successStoriesPage.metricsTitle', 'O Impacto da Guilda em Números')}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('successStoriesPage.metricsSubtitle', 'Dados reais de uma comunidade que cresce todos os dias')}
              </p>
            </div>
            
            {isLoadingStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { icon: Users, value: `${stats?.total_profiles || 0}+`, label: t('landing.successStories.founders', 'Fundadores') },
                  { icon: Heart, value: `${stats?.total_matches || 0}+`, label: t('landing.successStories.matches', 'Conexões') },
                  { icon: Rocket, value: `${stats?.total_projects || 0}+`, label: t('landing.successStories.projects', 'Projetos') },
                  { icon: MessageSquare, value: '+15', label: 'Ferramentas Grátis' },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl border border-black/10 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-black/10 mb-3">
                      <item.icon className="h-6 w-6 text-[#7610dc]" />
                    </div>
                    <p className="text-3xl md:text-4xl font-thin text-black" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>{item.value}</p>
                    <p className="text-sm text-gray-400 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                A Guilda Nasceu de Uma Dor Real
              </h2>
              <div className="space-y-4 text-gray-500 text-left md:text-center max-w-3xl mx-auto leading-relaxed">
                <p>
                  Fundadores talentosos muitas vezes estão sozinhos. Têm a ideia, a visão, a determinação — 
                  mas falta alguém com habilidades complementares para transformar o sonho em realidade.
                </p>
                <p>
                  A Guilda foi criada para resolver isso. Somos uma plataforma que conecta 
                  <strong className="text-black"> Builders</strong> (perfil técnico/produto) com 
                  <strong className="text-black"> Sellers</strong> (perfil negócios/growth) — 
                  as duas metades que toda startup precisa para decolar.
                </p>
                <p>
                  Diferente de outras plataformas, aqui o foco é na <strong className="text-black">complementaridade</strong>. 
                  Nosso algoritmo entende o que você oferece e o que precisa, e sugere matches que realmente fazem sentido.
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: Target, label: 'Match Inteligente', desc: 'Algoritmo de complementaridade' },
                { icon: Zap, label: 'Conexão Direta', desc: 'Chat sem burocracia' },
                { icon: Globe, label: 'Ferramentas', desc: '+15 tools para fundadores' },
                { icon: Award, label: 'Comunidade', desc: 'Fundadores reais ativos' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-black/10 p-4 text-center">
                  <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-5 w-5 text-[#7610dc]" />
                  </div>
                  <p className="font-medium text-sm text-black">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* User Quotes */}
            <div className="grid md:grid-cols-2 gap-4">
              {HIGHLIGHT_QUOTES.map((quote, idx) => (
                <div key={idx} className="rounded-2xl border border-black/10 p-4 flex items-start gap-3">
                  <Quote className="h-5 w-5 text-[#7610dc]/50 flex-shrink-0 mt-0.5" />
                  <p className="text-sm italic text-gray-500">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <section className="py-12 border-t border-black/5">
            <div className="max-w-6xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-[#f97316] mb-2">
                  Em Destaque
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-black">
                  {t('successStoriesPage.featuredTitle', 'Histórias que Inspiram')}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {featuredStories.slice(0, 3).map(story => (
                  <SuccessStoryCard
                    key={story.id}
                    story={story}
                    onClick={() => setSelectedStory(story)}
                    isFeatured
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stories Grid */}
        {publicStories.length > 0 && (
          <>
            {/* Filters */}
            <section className="py-4 border-y border-black/5 sticky top-16 bg-white z-10">
              <div className="max-w-6xl mx-auto px-4 lg:px-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <button
                    onClick={() => setSelectedType(null)}
                    className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedType === null
                        ? 'bg-[#7610dc] text-white border-[#7610dc]'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {t('successStoriesPage.filterAll', 'Todas')}
                  </button>
                  {PARTNERSHIP_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedType === type
                          ? 'bg-[#7610dc] text-white border-[#7610dc]'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {getPartnershipLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-8">
              <div className="max-w-6xl mx-auto px-4 lg:px-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-black">
                    {selectedType 
                      ? `${getPartnershipLabel(selectedType)} (${filteredStories.length})`
                      : t('successStoriesPage.allStories', 'Todas as Histórias')
                    }
                  </h2>
                </div>
                
                {isLoadingPublic ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Skeleton key={i} className="h-64 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {filteredStories.map(story => (
                      <SuccessStoryCard
                        key={story.id}
                        story={story}
                        onClick={() => setSelectedStory(story)}
                        isFeatured={story.status === 'featured'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Testimonials */}
        <TestimonialsCarousel page="success" limit={9} />

        {/* CTA */}
        <FinalCTA />

        <LandingFooter />
      </div>

      <SuccessStoryDetail
        story={selectedStory}
        open={!!selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </>
  );
}
