import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { LandingDarkNavbar, LandingFooter } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Zap, Users, MessageCircle, Infinity } from "lucide-react";

const Pricing = () => {
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const lang = currentLanguage as 'pt' | 'en' | 'es';

  const content = {
    pt: {
      title: "Tudo gratuito, sempre",
      subtitle: "Encontre seu co-fundador ideal sem pagar nada. Todas as funcionalidades liberadas.",
      cta: "Criar Perfil Grátis",
      features: [
        { icon: Users, text: "Matches ilimitados com founders" },
        { icon: MessageCircle, text: "Mensagens ilimitadas" },
        { icon: Zap, text: "Aceleração e mentoria" },
        { icon: Infinity, text: "Sem limites — tudo incluso" },
      ],
      metaTitle: "Guilda - Gratuito para Todos",
      metaDesc: "Encontre seu co-fundador de graça. Matching, aceleração, comunidade. Tudo liberado.",
    },
    en: {
      title: "Free for everyone, always",
      subtitle: "Find your ideal co-founder without paying anything. All features unlocked.",
      cta: "Create Free Profile",
      features: [
        { icon: Users, text: "Unlimited matches with founders" },
        { icon: MessageCircle, text: "Unlimited messaging" },
        { icon: Zap, text: "Acceleration and mentoring" },
        { icon: Infinity, text: "No limits — everything included" },
      ],
      metaTitle: "Guilda - Free for Everyone",
      metaDesc: "Find your co-founder for free. Matching, acceleration, community. Everything unlocked.",
    },
    es: {
      title: "Todo gratis, siempre",
      subtitle: "Encuentra tu co-fundador ideal sin pagar nada. Todas las funciones liberadas.",
      cta: "Crear Perfil Gratis",
      features: [
        { icon: Users, text: "Matches ilimitados con founders" },
        { icon: MessageCircle, text: "Mensajes ilimitados" },
        { icon: Zap, text: "Aceleración y mentoría" },
        { icon: Infinity, text: "Sin límites — todo incluido" },
      ],
      metaTitle: "Guilda - Gratis para Todos",
      metaDesc: "Encuentra tu co-fundador gratis. Matching, aceleración, comunidad. Todo liberado.",
    },
  };

  const c = content[lang] || content.pt;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDesc} />
        <link rel="canonical" href="https://www.guilda.app.br/pricing" />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:url" content="https://www.guilda.app.br/pricing" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
      </Helmet>

      <LandingDarkNavbar />

      {/* Hero Section */}
      <header className="pt-24 sm:pt-32 pb-8 sm:pb-12 text-center px-5">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs sm:text-sm font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          {lang === 'pt' ? '100% Gratuito' : lang === 'es' ? '100% Gratis' : '100% Free'}
        </div>
        <h1
          className="text-3xl sm:text-5xl md:text-7xl font-serif font-thin leading-[0.95] tracking-tight text-black mb-4 sm:mb-6 px-2"
          style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
        >
          {c.title}
        </h1>
        <p className="text-sm sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed px-2 mb-8">
          {c.subtitle}
        </p>
        <Button
          size="lg"
          className="bg-[#7610dc] hover:bg-[#5e0db0] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate('/auth')}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {c.cta}
        </Button>
      </header>

      {/* Features Grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {c.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#7610dc]/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#7610dc]" />
                </div>
                <div className="text-left">
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    {feature.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-4">
            {lang === 'pt' ? 'Sem pegadinhas. Sem planos. Sem limite de uso.' :
             lang === 'es' ? 'Sin trampas. Sin planes. Sin límite de uso.' :
             'No tricks. No plans. No usage limits.'}
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-[#7610dc] text-[#7610dc] hover:bg-[#7610dc] hover:text-white px-8 py-6 text-lg rounded-xl transition-all"
            onClick={() => navigate('/auth')}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {c.cta}
          </Button>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Pricing;
