import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { 
  TrendingUp, Search, CheckCircle, ArrowRight, DollarSign, Target, 
  Check, BarChart3, Users, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";

const Investors = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats } = usePlatformStats();

  return (
    <>
      <Helmet>
        <title>{t('investors.pageTitle', 'Investidores - Encontre Sua Próxima Startup')} | Guilda</title>
        <meta name="description" content={t('investors.pageDescription', 'Conecte-se com founders verificados buscando capital. Deal flow qualificado para investidores anjo e seed.')} />
        <meta name="keywords" content="investidor anjo, angel investor, investimento startup, seed capital, founders brasil, deal flow, investir em startups" />
        <meta property="og:title" content={`${t('investors.pageTitle', 'Investidores - Encontre Sua Próxima Startup')} | Guilda`} />
        <meta property="og:description" content={t('investors.pageDescription', 'Conecte-se com founders verificados buscando capital. Deal flow qualificado para investidores anjo e seed.')} />
        <meta property="og:url" content="https://www.guilda.app.br/investors" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <link rel="canonical" href="https://www.guilda.app.br/investors" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t('investors.pageTitle', 'Investidores - Encontre Sua Próxima Startup'),
            "description": t('investors.pageDescription'),
            "url": "https://www.guilda.app.br/investors",
            "isPartOf": { "@type": "WebSite", "name": "Guilda", "url": "https://www.guilda.app.br" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white text-black antialiased selection:bg-[#7610DC]/20">
        <LandingDarkNavbar />
        <SocialPaymentBanner />

        {/* Hero */}
        <header className="pt-28 sm:pt-32 pb-16 sm:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-black/10 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 mb-6">
                <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                {t('investors.hero.badge', 'Deal Flow Qualificado')}
              </div>

              <h1
                className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('investors.hero.title', 'Encontre Sua Próxima')}{' '}
                <span className="text-[#7610DC]">
                  {t('investors.hero.highlight', 'Startup Unicórnio')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
                {t('investors.hero.subtitle', 'Founders verificados com projetos validados. Sem pitch decks genéricos, apenas oportunidades reais de investimento.')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/capital" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl gap-3 text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                    <Search className="w-5 h-5" />
                    {t('investors.hero.ctaPrimary', 'Ver Founders')}
                  </Button>
                </Link>
                <Link to="/auth?view=signup" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="border-gray-200 text-black hover:bg-gray-50 rounded-xl px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                    {t('investors.hero.ctaSecondary', 'Criar Perfil de Investidor')}
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-xs text-gray-400 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  +{stats?.total_profiles || 1500} {t('investors.hero.activeFounders', 'founders ativos')}
                </span>
                <span className="hidden sm:inline mx-2">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {t('investors.hero.verifiedProfiles', 'Perfis verificados')}
                </span>
              </p>
            </div>

            {/* Visual Cards */}
            <div className="relative hidden lg:block h-[400px]">
              {/* Founder Card */}
              <div className="absolute top-0 right-10 bg-white rounded-2xl lg:rounded-[2rem] border border-black/10 p-6 w-72 transform rotate-3 z-10">
                <div className="absolute -top-4 -right-4 bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-xs border border-green-200">
                  {t('investors.hero.verified', 'Verificado')}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">Seed</span>
                </div>
                <h3 className="font-bold text-lg text-black">FinTech B2B</h3>
                <p className="text-xs text-gray-400 mt-2 mb-4">Captando: R$ 500k • Valuation: R$ 3M</p>
                <div className="flex items-center gap-2 mt-4">
                  <img src="https://i.pravatar.cc/100?img=12" className="w-8 h-8 rounded-full border-2 border-[#7610DC]/20" alt="Founder" />
                  <div>
                    <p className="text-sm font-bold text-black">Ana L.</p>
                    <p className="text-[10px] text-gray-400">Builder • Ex-Nubank</p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="absolute top-28 left-10 bg-gray-50 rounded-2xl lg:rounded-[2rem] border border-black/10 p-6 w-72 transform -rotate-3 z-20">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 bg-[#7610DC]/10 rounded-xl flex items-center justify-center text-[#7610DC]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold bg-[#7610DC] text-white px-2 py-1 rounded-full">Pipeline</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t('investors.hero.dealsSeen', 'Deals analisados')}</span>
                    <span className="text-lg font-bold text-black">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t('investors.hero.callsScheduled', 'Calls agendadas')}</span>
                    <span className="text-lg font-bold text-[#7610DC]">8</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7610DC] w-1/3" />
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">{t('investors.hero.conversionRate', 'Taxa de conversão: 33%')}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Showcase */}
        <div className="py-8 sm:py-10 border-y border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-center md:text-left">
                {t('investors.stats.title', 'Ecossistema Ativo')}
              </p>
              <div className="flex gap-6 sm:gap-12 overflow-x-auto pb-2 max-w-full">
                <div className="text-center whitespace-nowrap">
                  <p className="text-2xl sm:text-3xl font-bold text-[#7610DC]">{stats?.total_profiles || '1.5k'}+</p>
                  <p className="text-xs text-gray-400">{t('investors.stats.founders', 'Founders')}</p>
                </div>
                <div className="text-center whitespace-nowrap">
                  <p className="text-2xl sm:text-3xl font-bold text-[#7610DC]">{stats?.total_projects || '320'}+</p>
                  <p className="text-xs text-gray-400">{t('investors.stats.startups', 'Startups')}</p>
                </div>
                <div className="text-center whitespace-nowrap">
                  <p className="text-2xl sm:text-3xl font-bold text-[#7610DC]">{stats?.total_matches || '2.8k'}+</p>
                  <p className="text-xs text-gray-400">{t('investors.stats.connections', 'Conexões')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pain Points */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <h2
                className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('investors.painPoints.title', 'Problemas que Resolvemos')}
              </h2>
              <p className="text-gray-500">
                {t('investors.painPoints.subtitle', 'Investir em startups não precisa ser um jogo de sorte')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              <div className="border border-black/10 p-6 sm:p-8 rounded-2xl lg:rounded-[2rem] hover:border-[#7610DC]/30 transition-colors">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Target className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">
                  {t('investors.painPoints.problem1.title', 'Deal Flow Fragmentado')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t('investors.painPoints.problem1.description', 'Recebe pitch decks por email, LinkedIn, WhatsApp... Impossível organizar e priorizar oportunidades.')}
                </p>
              </div>

              <div className="border border-black/10 p-6 sm:p-8 rounded-2xl lg:rounded-[2rem] hover:border-[#7610DC]/30 transition-colors">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-50 text-[#F97316] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Users className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">
                  {t('investors.painPoints.problem2.title', 'Founders Sem Validação')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t('investors.painPoints.problem2.description', 'Difícil avaliar se o founder tem capacidade de execução antes de investir tempo em calls.')}
                </p>
              </div>

              <div className="border border-[#7610DC]/20 bg-[#7610DC]/5 p-6 sm:p-8 rounded-2xl lg:rounded-[2rem]">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#7610DC] text-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">
                  {t('investors.painPoints.solution.title', 'Deal Flow Qualificado')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 sm:mb-6">
                  {t('investors.painPoints.solution.description', 'Founders com perfis completos, skills verificadas e projetos documentados. Filtre por stage, setor e tese de investimento.')}
                </p>
                <Link to="/capital" className="text-[#7610DC] text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  {t('investors.painPoints.solution.cta', 'Acessar Deal Flow')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 sm:py-24 border-t border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 sm:space-y-12">
              <h2
                className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6 sm:mb-8"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('investors.howItWorks.title', 'Como Funciona para Investidores')}
              </h2>

              {[
                { title: t('investors.howItWorks.step1.title', 'Crie Seu Perfil'), description: t('investors.howItWorks.step1.description', 'Defina sua tese de investimento, ticket médio e setores de interesse.') },
                { title: t('investors.howItWorks.step2.title', 'Filtre Founders'), description: t('investors.howItWorks.step2.description', 'Busque por stage, vertical, skills do time e indicadores de tração.') },
                { title: t('investors.howItWorks.step3.title', 'Conecte e Invista'), description: t('investors.howItWorks.step3.description', 'Inicie conversas diretas. Sem intermediários, sem pitch competitions.') },
              ].map((step, index) => (
                <div key={index} className="flex gap-4 sm:gap-6 group">
                  <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-2xl border border-black/10 flex items-center justify-center font-bold text-[#7610DC] group-hover:bg-[#7610DC] group-hover:text-white group-hover:border-[#7610DC] transition-colors text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-black mb-1 sm:mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: Dashboard */}
            <div className="hidden lg:block">
              <div className="bg-gray-50 border border-black/10 rounded-2xl lg:rounded-[2rem] overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-black/5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Guilda Capital</div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">{t('investors.dashboard.dealFlow', 'Deal Flow')}</p>
                      <h4 className="text-2xl font-bold text-black">15 {t('investors.dashboard.newDeals', 'novos deals')}</h4>
                    </div>
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">+5 {t('investors.dashboard.thisWeek', 'esta semana')}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#7610DC]/10 text-[#7610DC] flex items-center justify-center font-bold">F</div>
                        <div>
                          <p className="text-sm font-bold text-black">FinFlow</p>
                          <p className="text-[10px] text-gray-400">B2B SaaS • Seed • 2 Founders</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-white bg-[#7610DC] px-3 py-1.5 rounded-xl">{t('investors.dashboard.view', 'Ver')}</button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">H</div>
                        <div>
                          <p className="text-sm font-bold text-black">HealthAI</p>
                          <p className="text-[10px] text-gray-400">HealthTech • Pre-Seed • 3 Founders</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-white bg-[#7610DC] px-3 py-1.5 rounded-xl">{t('investors.dashboard.view', 'Ver')}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 border-t border-black/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-[#7610DC] mx-auto mb-6" />
            <h2
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t('investors.cta.title', 'Pronto para Encontrar Seu Próximo Deal?')}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('investors.cta.subtitle', 'Junte-se a investidores que já estão conectando com founders qualificados.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?view=signup" className="w-full sm:w-auto">
                <Button size="lg" className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                  {t('investors.cta.button', 'Começar Agora')}
                </Button>
              </Link>
              <Link to="/capital" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="border-gray-200 text-black hover:bg-gray-50 rounded-xl text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                  {t('investors.cta.secondary', 'Ver Startups')}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-gray-400 text-xs">{t('investors.cta.free', 'Cadastro gratuito')}</p>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};

export default Investors;
