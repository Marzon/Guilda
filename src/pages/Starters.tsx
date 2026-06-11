import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { 
  Compass, Sparkles, ArrowRight, HelpCircle, Briefcase, Check,
  BookOpen, Users, Target, Trophy, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FinalCTA } from "@/components/landing/FinalCTA";

const SUPREMA_PRO_URL = "https://suprema.guilda.app.br/pro";

const Starters = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('starters.pageTitle')} | Guilda</title>
        <meta name="description" content={t('starters.pageDescription')} />
        <meta name="keywords" content="iniciante startup, como começar startup, primeiro negócio, aprender empreendedorismo, cofundador iniciante, builder ou seller" />
        <meta property="og:title" content={`${t('starters.pageTitle')} | Guilda`} />
        <meta property="og:description" content={t('starters.pageDescription')} />
        <meta property="og:url" content="https://www.guilda.app.br/starters" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <link rel="canonical" href="https://www.guilda.app.br/starters" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t('starters.pageTitle'),
            "description": t('starters.pageDescription'),
            "url": "https://www.guilda.app.br/starters",
            "isPartOf": { "@type": "WebSite", "name": "Guilda", "url": "https://www.guilda.app.br" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingDarkNavbar />

        {/* Hero */}
        <header className="pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h1
                className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('starters.hero.title', 'Descubra sua vocação e dê o')}{' '}
                <span className="text-[#7610dc]">
                  {t('starters.hero.highlight', 'primeiro passo.')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
                {t('starters.hero.subtitle', 'Não tem experiência técnica ou comercial? A Guilda é o lugar para explorar, aprender e encontrar seu caminho no mundo das startups.')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={SUPREMA_PRO_URL} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 rounded-xl bg-[#7610dc] hover:bg-[#7610dc]/90 text-white font-bold text-base px-8 py-5">
                    <Rocket className="w-5 h-5" />
                    {t('starters.hero.ctaPrimary', 'Começar Agora')}
                  </Button>
                </a>
                <Link to="/vagas" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full rounded-xl border-gray-200 text-black hover:bg-gray-50 font-medium px-8 py-5">
                    {t('starters.hero.ctaSecondary', 'Ver Oportunidades')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual - Journey cards */}
            <div className="relative hidden lg:block h-[400px]">
              <div className="absolute top-0 left-10 rounded-2xl border border-black/10 p-6 w-64 transform -rotate-3 bg-white z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl border border-black/10 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-[#f97316]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">{t('starters.visual.youAreHere', 'Você está aqui')}</p>
                    <p className="text-xs text-gray-400">{t('starters.visual.curious', 'Curioso sobre startups')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                    <span>{t('starters.visual.noExperience', 'Sem experiência formal')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                    <span>{t('starters.visual.dontKnow', 'Não sei se sou técnico ou comercial')}</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 right-0 rounded-2xl border-2 border-[#7610dc] p-6 w-72 transform rotate-3 bg-white z-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#7610dc] flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">{t('starters.visual.destination', 'Seu destino')}</p>
                    <p className="text-xs text-gray-500">{t('starters.visual.ready', 'Pronto para empreender')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-4 h-4 text-[#7610dc]" />
                    <span>{t('starters.visual.foundPath', 'Descobriu seu perfil')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-4 h-4 text-[#7610dc]" />
                    <span>{t('starters.visual.connected', 'Conectado com mentores')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-4 h-4 text-[#7610dc]" />
                    <span>{t('starters.visual.firstProject', 'Primeiro projeto em andamento')}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white">
                  <Compass className="w-5 h-5 text-[#7610dc]" />
                  <span className="text-sm font-bold text-black">{t('starters.visual.journey', 'Sua jornada')}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Pain Points */}
        <section className="py-16 border-t border-black/5">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('starters.painPoints.title', 'Você se identifica?')}
              </h2>
              <p className="text-gray-500">
                {t('starters.painPoints.subtitle', 'É normal não saber por onde começar')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
              <div className="rounded-2xl lg:rounded-[2rem] border border-black/10 p-6 sm:p-8">
                <div className="w-12 h-12 rounded-xl border border-black/10 flex items-center justify-center mb-6">
                  <HelpCircle className="w-6 h-6 text-[#f97316]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {t('starters.painPoints.confusion.title', 'Não sabe se é Builder ou Seller')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t('starters.painPoints.confusion.description', 'Você tem interesse em startups mas ainda não descobriu qual é seu perfil ideal — técnico ou comercial.')}
                </p>
              </div>

              <div className="rounded-2xl lg:rounded-[2rem] border border-black/10 p-6 sm:p-8">
                <div className="w-12 h-12 rounded-xl border border-black/10 flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6 text-[#f97316]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {t('starters.painPoints.experience.title', 'Falta de experiência')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t('starters.painPoints.experience.description', 'Quer contribuir com projetos reais mas não tem portfólio ou track record para mostrar.')}
                </p>
              </div>

              <div className="rounded-2xl lg:rounded-[2rem] border-2 border-[#7610dc] p-6 sm:p-8">
                <div className="w-12 h-12 rounded-xl bg-[#7610dc] flex items-center justify-center mb-6">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {t('starters.painPoints.solution.title', 'A Guilda te ajuda')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {t('starters.painPoints.solution.description', 'Ambiente seguro para explorar, aprender e crescer. Sem pressão. No seu ritmo.')}
                </p>
                <a href={SUPREMA_PRO_URL} className="text-[#7610dc] text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  {t('starters.painPoints.solution.cta', 'Criar perfil grátis')} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 border-t border-black/5">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-serif font-thin leading-[0.9] tracking-tight text-black"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('starters.benefits.title', 'O que você pode fazer aqui')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, title: t('starters.benefits.tavern.title', 'Explorar a Taverna'), desc: t('starters.benefits.tavern.description', 'Conheça Builders, Sellers e Investidores. Veja como eles se apresentam e aprenda com seus perfis.') },
                { icon: BookOpen, title: t('starters.benefits.library.title', 'Acessar a Biblioteca'), desc: t('starters.benefits.library.description', 'Livros essenciais e materiais curados sobre startups, validação e growth.') },
                { icon: Target, title: t('starters.benefits.missions.title', 'Participar de Missões'), desc: t('starters.benefits.missions.description', 'Complete desafios, ganhe XP e evolua seu perfil na plataforma.') },
                { icon: Briefcase, title: t('starters.benefits.jobs.title', 'Candidatar-se a Vagas'), desc: t('starters.benefits.jobs.description', 'Encontre oportunidades como aprendiz, estagiário ou contribuidor em startups.') },
              ].map((item, i) => (
                <div key={i} className="group rounded-2xl border border-black/10 p-6 hover:border-[#7610dc]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl border border-black/10 flex items-center justify-center mb-4 group-hover:bg-[#7610dc] group-hover:border-[#7610dc] group-hover:text-white transition-colors">
                    <item.icon className="w-6 h-6 text-[#7610dc] group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 border-t border-black/5">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-12 text-center"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t('starters.flow.title', 'Como funciona')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="relative text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#7610dc] flex items-center justify-center font-serif font-thin text-2xl text-[#7610dc] mx-auto mb-6" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gray-200" />
                  )}
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {t(`starters.flow.step${step}.title`)}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {t(`starters.flow.step${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA />
        <LandingFooter />
      </div>
    </>
  );
};

export default Starters;
