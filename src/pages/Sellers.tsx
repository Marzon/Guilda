import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { 
  TrendingUp, Search, CheckCircle, ArrowRight, Banknote, UserX, Check, PieChart, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartAvatar } from "@/components/GuildaAvatar";

const Sellers = () => {
  const { t } = useTranslation();
  const { data: stats } = usePlatformStats();

  const { data: realBuilder } = useQuery({
    queryKey: ["sellers-page-builder"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, archetype")
        .eq("archetype", "BUILDER")
        .not("avatar_url", "is", null)
        .limit(1)
        .single();
      return data;
    },
    staleTime: 5 * 60_000,
  });

  return (
    <>
      <Helmet>
        <title>{t('sellers.pageTitle')} | Guilda</title>
        <meta name="description" content={t('sellers.pageDescription')} />
        <meta name="keywords" content="encontrar desenvolvedor para startup, sócio técnico, tech cofounder, parceiro programador, MVP startup, construir aplicativo" />
        <meta property="og:title" content={`${t('sellers.pageTitle')} | Guilda`} />
        <meta property="og:description" content={t('sellers.pageDescription')} />
        <meta property="og:url" content="https://www.guilda.app.br/sellers" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <link rel="canonical" href="https://www.guilda.app.br/sellers" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t('sellers.pageTitle'),
            "description": t('sellers.pageDescription'),
            "url": "https://www.guilda.app.br/sellers",
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
                Market Fit First
              </div>

              <h1
                className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('sellers.heroTitle')}{' '}
                <span className="text-[#7610DC]">PowerPoint.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
                {t('sellers.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth?view=signup" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl gap-3 text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                    <Search className="w-5 h-5" />
                    {t('sellers.findCTO')}
                  </Button>
                </Link>
                <Link to="/startups" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="border-gray-200 text-black hover:bg-gray-50 rounded-xl px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                    {t('sellers.viewBuilders')}
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-xs text-gray-400 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  +{stats?.total_profiles || 1500} {t('sellers.activeDevelopers')}
                </span>
                <span className="hidden sm:inline mx-2">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {t('sellers.noAgencies')}
                </span>
              </p>
            </div>

            {/* Visual Cards */}
            <div className="relative hidden lg:block h-[400px]">
              {/* Business Card */}
              <div className="absolute top-0 right-10 bg-white rounded-2xl lg:rounded-[2rem] border border-black/10 p-6 w-72 transform rotate-3 z-10">
                <div className="absolute -top-4 -right-4 bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-xs border border-green-200">
                  {t('sellers.validated')}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">{t('sellers.validated')}</span>
                </div>
                <h3 className="font-bold text-lg text-black">SaaS Finanças B2B</h3>
                <p className="text-xs text-gray-400 mt-2 mb-4">TAM: R$ 50B • CAC: R$ 50</p>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7610DC] w-3/4" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">Business Plan: 75% Ready</p>
              </div>

              {/* Tech Card */}
              <div className="absolute top-28 left-10 bg-gray-50 rounded-2xl lg:rounded-[2rem] border border-black/10 p-6 w-72 transform -rotate-3 z-20">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 bg-[#7610DC]/10 rounded-xl flex items-center justify-center text-[#7610DC]">
                    <Code className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold bg-[#7610DC] text-white px-2 py-1 rounded-full">CTO Finder</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#7610DC]/20 overflow-hidden flex-shrink-0">
                      <SmartAvatar
                        avatarUrl={realBuilder?.avatar_url}
                        name={realBuilder?.username || "Builder"}
                        archetype="BUILDER"
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-black">{realBuilder?.username || "Builder"}</p>
                      <p className="text-[10px] text-gray-400">Senior Fullstack • React</p>
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-xs text-gray-500 border border-black/5 border-l-2 border-l-green-500">
                    "{t('sellers.developerQuote')}"
                  </div>
                  <button className="w-full bg-[#7610DC] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#7610DC]/90 transition-colors">
                    {t('sellers.acceptConnection')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Talent Showcase */}
        <div className="py-8 sm:py-10 border-y border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-center md:text-left">
                {t('sellers.talentFrom')}
              </p>
              <div className="flex gap-4 sm:gap-8 text-gray-300 hover:text-gray-500 transition-colors overflow-x-auto pb-2 max-w-full">
                <span className="font-bold text-base sm:text-xl whitespace-nowrap">▲ Vercel</span>
                <span className="font-bold text-base sm:text-xl whitespace-nowrap">● Nubank</span>
                <span className="font-bold text-base sm:text-xl whitespace-nowrap">■ Stripe</span>
                <span className="font-bold text-base sm:text-xl whitespace-nowrap">⬡ Shopify</span>
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
                {t('sellers.painPointsTitle')}
              </h2>
              <p className="text-gray-500">{t('sellers.painPointsSubtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {/* Pain 1 */}
              <div className="border border-black/10 p-6 sm:p-8 rounded-2xl lg:rounded-[2rem] hover:border-[#7610DC]/30 transition-colors">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Banknote className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">{t('sellers.pain1Title')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t('sellers.pain1Description')}</p>
              </div>

              {/* Pain 2 */}
              <div className="border border-black/10 p-6 sm:p-8 rounded-2xl lg:rounded-[2rem] hover:border-[#7610DC]/30 transition-colors">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-50 text-[#F97316] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <UserX className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">{t('sellers.pain2Title')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t('sellers.pain2Description')}</p>
              </div>

              {/* Solution */}
              <div className="border border-[#7610DC]/20 bg-[#7610DC]/5 p-6 sm:p-8 rounded-2xl lg:rounded-[2rem]">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#7610DC] text-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">{t('sellers.solutionTitle')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 sm:mb-6">{t('sellers.solutionDescription')}</p>
                <Link to="/auth?view=signup" className="text-[#7610DC] text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  {t('sellers.startSearch')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 sm:py-24 border-t border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Steps */}
            <div className="space-y-8 sm:space-y-12">
              <h2
                className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6 sm:mb-8"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('sellers.howItWorksTitle')}
              </h2>

              {[1, 2, 3].map((step) => (
                <div key={step} className="flex gap-4 sm:gap-6 group">
                  <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-2xl border border-black/10 flex items-center justify-center font-bold text-[#7610DC] group-hover:bg-[#7610DC] group-hover:text-white group-hover:border-[#7610DC] transition-colors text-sm sm:text-base">
                    {step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-black mb-1 sm:mb-2">{t(`sellers.step${step}.title`)}</h3>
                    <p className="text-gray-500 text-sm">{t(`sellers.step${step}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: Dashboard */}
            <div className="hidden lg:block">
              <div className="bg-gray-50 border border-black/10 rounded-2xl lg:rounded-[2rem] overflow-hidden">
                {/* Fake UI Header */}
                <div className="bg-gray-100 px-4 py-3 border-b border-black/5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Guilda Dashboard</div>
                </div>

                {/* Fake UI Body */}
                <div className="p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">{t('sellers.candidatesFor')}</p>
                      <h4 className="text-2xl font-bold text-black">12 {t('sellers.qualifiedProfiles')}</h4>
                    </div>
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">+3 {t('sellers.today')}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#7610DC]/10 text-[#7610DC] flex items-center justify-center font-bold">L</div>
                        <div>
                          <p className="text-sm font-bold text-black">Lucas T.</p>
                          <p className="text-[10px] text-gray-400">Tech Lead @ BigTech</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-white bg-[#7610DC] px-3 py-1.5 rounded-xl">{t('sellers.viewProfile')}</button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">M</div>
                        <div>
                          <p className="text-sm font-bold text-black">Mariana P.</p>
                          <p className="text-[10px] text-gray-400">AI Specialist</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-white bg-[#7610DC] px-3 py-1.5 rounded-xl">{t('sellers.viewProfile')}</button>
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
            <h2
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t('sellers.ctaTitle')}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('sellers.ctaSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?view=signup" className="w-full sm:w-auto">
                <Button size="lg" className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                  {t('sellers.createBusinessProfile')}
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="border-gray-200 text-black hover:bg-gray-50 rounded-xl text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors w-full">
                  {t('sellers.viewPlans')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};

export default Sellers;
