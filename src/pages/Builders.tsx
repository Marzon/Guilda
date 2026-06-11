import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { 
  Terminal, Code2, AlertTriangle, Clock, FileWarning, 
  Check, Atom, Server, Database, Smartphone, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartAvatar } from "@/components/GuildaAvatar";

const Builders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats } = usePlatformStats();

  const { data: realSeller } = useQuery({
    queryKey: ["builders-page-seller"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, archetype")
        .eq("archetype", "SELLER")
        .not("avatar_url", "is", null)
        .limit(1)
        .single();
      return data;
    },
    staleTime: 5 * 60_000,
  });

  const stackDemand = [
    { icon: Atom, name: "React Native", count: 142 },
    { icon: Server, name: "Node.js", count: 89 },
    { icon: Database, name: "Python/AI", count: 203 },
    { icon: Smartphone, name: "Flutter", count: 56 },
  ];

  const problems = [
    {
      icon: AlertTriangle,
      iconColor: "text-red-500",
      titleKey: "geniusIdea",
      descriptionKey: "geniusIdeaDesc",
      fixKey: "verifiedSellers",
    },
    {
      icon: Clock,
      iconColor: "text-[#F97316]",
      titleKey: "zeroMarketing",
      descriptionKey: "zeroMarketingDesc",
      fixKey: "growthPartners",
    },
    {
      icon: FileWarning,
      iconColor: "text-[#7610DC]",
      titleKey: "verbalContracts",
      descriptionKey: "verbalContractsDesc",
      fixKey: "standardContracts",
    },
  ];

  const steps = [
    { number: "01", key: "defineStack" },
    { number: "02", key: "filterSellers" },
    { number: "03", key: "commitContract" },
  ];

  return (
    <>
      <Helmet>
        <title>{t('builders.pageTitle')} | Guilda</title>
        <meta name="description" content={t('builders.pageDescription')} />
        <meta name="keywords" content="desenvolvedor procurando sócio, tech cofounder, developer startup, programador empreendedor, encontrar sócio de negócios" />
        <meta property="og:title" content={`${t('builders.pageTitle')} | Guilda`} />
        <meta property="og:description" content={t('builders.pageDescription')} />
        <meta property="og:url" content="https://www.guilda.app.br/builders" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <link rel="canonical" href="https://www.guilda.app.br/builders" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t('builders.pageTitle'),
            "description": t('builders.pageDescription'),
            "url": "https://www.guilda.app.br/builders",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Guilda",
              "url": "https://www.guilda.app.br"
            }
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
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t('builders.hero.status', 'Disponível para match')}
              </div>
              
              <h1
                className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('builders.hero.title')}{' '}
                <span className="text-[#7610DC]">
                  {t('builders.hero.highlight')}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
                {t('builders.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/auth?view=signup')}
                  size="lg"
                  className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl gap-3 text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors"
                >
                  <Terminal className="w-5 h-5" />
                  {t('builders.hero.ctaPrimary')}
                </Button>
                <Button 
                  onClick={() => navigate('/startups')}
                  variant="outline"
                  size="lg"
                  className="border-gray-200 text-black hover:bg-gray-50 rounded-xl text-sm px-6 sm:px-8 py-5 sm:py-6 transition-colors"
                >
                  {t('builders.hero.ctaSecondary')}
                </Button>
              </div>
            </div>

            {/* Visual: Notification Card */}
            <div className="relative hidden lg:block">
              {/* Code Window */}
              <div className="bg-gray-50 rounded-[2rem] border border-black/10 p-5">
                <div className="flex gap-2 mb-4 border-b border-black/5 pb-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400 ml-2 font-mono">marketing_api.ts</span>
                </div>
                <div className="font-mono text-xs leading-relaxed">
                  <p className="text-[#7610DC]">const <span className="text-blue-600">product</span> = <span className="text-[#F97316]">new</span> Startup();</p>
                  <p className="text-gray-400">// TODO: Find someone to sell this...</p>
                  <p className="text-[#7610DC]">if <span className="text-[#F97316]">(!coFounder)</span> {'{'}</p>
                  <p className="pl-4 text-red-500">throw <span className="text-[#F97316]">new</span> Error(<span className="text-green-600">'Revenue is zero'</span>);</p>
                  <p className="text-[#7610DC]">{'}'}</p>
                  <p className="text-gray-300 animate-pulse">_</p>
                </div>
              </div>

              <div className="absolute -right-4 top-16 bg-white border border-black/10 p-4 rounded-2xl w-64">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#F97316]/30 overflow-hidden flex-shrink-0">
                    <SmartAvatar
                      avatarUrl={realSeller?.avatar_url}
                      name={realSeller?.username || "Seller"}
                      archetype="SELLER"
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-black">{realSeller?.username || "Seller"}</p>
                    <p className="text-xs text-gray-400">Produto SaaS B2B</p>
                  </div>
                </div>
                <p className="text-xs font-medium bg-green-50 text-green-700 p-2 rounded-xl">
                  {t('builders.hero.sellerMessage')}
                </p>
                <div className="mt-2 flex gap-2">
                  <button className="bg-[#7610DC] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex-1 transition-colors hover:bg-[#7610DC]/90">Accept</button>
                  <button className="bg-gray-50 border border-gray-200 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-xl flex-1 hover:bg-gray-100 transition-colors">View Deck</button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stack Demand */}
        <div className="border-y border-black/5 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-medium text-center text-gray-400 mb-4 sm:mb-6 uppercase tracking-widest">
              {t('builders.stackDemand.title')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {stackDemand.map(({ icon: Icon, name, count }) => (
                <div 
                  key={name}
                  className="flex items-center gap-2 sm:gap-3 border border-black/10 px-3 sm:px-4 py-2 rounded-full hover:border-[#7610DC]/30 transition-colors cursor-default"
                >
                  <Icon className="text-[#7610DC] w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-black">{name}</span>
                  <span className="text-[10px] sm:text-xs bg-[#7610DC]/10 text-[#7610DC] px-1.5 py-0.5 rounded-full font-medium">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Problem */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2
                className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('builders.debug.title')}
              </h2>
              <p className="text-gray-500">{t('builders.debug.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {problems.map(({ icon: Icon, iconColor, titleKey, descriptionKey, fixKey }) => (
                <div 
                  key={titleKey}
                  className="border border-black/10 p-5 sm:p-6 rounded-2xl lg:rounded-[2rem] hover:border-[#7610DC]/30 transition-colors group"
                >
                  <div className={`${iconColor} text-xs mb-4 flex items-center gap-2`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{t(`builders.debug.problem.${titleKey}`)}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                    {t(`builders.debug.problem.${titleKey}`)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(`builders.debug.problem.${descriptionKey}`)}
                  </p>
                  <div className="mt-4 pt-4 border-t border-black/5 text-green-600 text-xs font-medium flex items-center gap-2">
                    <Check className="w-3 h-3 flex-shrink-0" />
                    Fix: {t(`builders.debug.fix.${fixKey}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 sm:py-24 border-t border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Steps */}
              <div className="space-y-8 sm:space-y-12">
                <h2
                  className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6 sm:mb-8"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  {t('builders.flow.title')}
                </h2>
                
                {steps.map(({ number, key }) => (
                  <div key={number} className="flex gap-4 sm:gap-6">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-black/10 flex items-center justify-center font-mono text-[#7610DC] font-bold text-lg sm:text-xl">
                      {number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                        {t(`builders.flow.step.${key}.title`)}
                      </h3>
                      <p className="text-gray-500 text-sm sm:text-base">
                        {t(`builders.flow.step.${key}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual: Profile Card */}
              <div className="bg-gray-50 rounded-2xl lg:rounded-[2rem] overflow-hidden border border-black/10 font-mono text-xs sm:text-sm">
                <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-black/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs ml-2">user_profile.json</span>
                </div>
                <div className="p-4 sm:p-6 text-gray-600">
                  <p><span className="text-[#7610DC]">"role"</span>: <span className="text-green-600">"Builder"</span>,</p>
                  <p><span className="text-[#7610DC]">"skills"</span>: [</p>
                  <p className="pl-4"><span className="text-[#F97316]">"React"</span>, <span className="text-[#F97316]">"Node.js"</span>, <span className="text-[#F97316]">"AWS"</span></p>
                  <p>],</p>
                  <p><span className="text-[#7610DC]">"looking_for"</span>: {'{'}</p>
                  <p className="pl-4"><span className="text-blue-600">"partner_type"</span>: <span className="text-green-600">"Seller"</span>,</p>
                  <p className="pl-4"><span className="text-blue-600">"superpower"</span>: <span className="text-green-600">"B2B Sales"</span>,</p>
                  <p className="pl-4"><span className="text-blue-600">"min_equity"</span>: <span className="text-[#F97316]">"30%"</span></p>
                  <p>{'}'}</p>
                  <p className="mt-4 text-gray-400">// Scanning for matches...</p>
                  <p className="text-[#7610DC] animate-pulse">&gt; Match found: Rafael (Fintech Expert) [98%]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 border-t border-black/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#7610DC] mx-auto mb-6" />
            <h2
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t('builders.cta.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('builders.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/auth?view=signup')}
                size="lg"
                className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors"
              >
                {t('builders.cta.button')}
              </Button>
              <Button 
                onClick={() => navigate('/startups')}
                variant="outline"
                size="lg"
                className="border-gray-200 text-black hover:bg-gray-50 rounded-xl text-base px-6 sm:px-8 py-5 sm:py-6 transition-colors"
              >
                {t('builders.cta.secondary')}
              </Button>
            </div>

            <p className="text-gray-400 text-xs mt-4">
              {stats?.total_profiles
                ? t('builders.cta.socialProof', { count: stats.total_profiles })
                : t('builders.cta.socialProofDefault', 'Junte-se a centenas de builders.')}
            </p>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};

export default Builders;
