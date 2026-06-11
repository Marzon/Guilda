import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PixPaymentModal } from "@/components/monetization/PixPaymentModal";
import { VoucherRedemption } from "@/components/monetization/VoucherRedemption";
import { SocialPaymentDialog } from "@/components/monetization/SocialPaymentDialog";
import { SocialPaymentMarketingDialog } from "@/components/monetization/SocialPaymentMarketingDialog";
import { CreditPlansSection } from "@/components/monetization/CreditPlansSection";
import { useLanguage } from "@/hooks/useLanguage";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { LandingDarkNavbar, LandingFooter } from "@/components/landing";


const Pricing = () => {
  const { currentLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();
  const { refresh: refreshSubscription } = useSubscription(authData?.user?.id || null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [marketingDialogOpen, setMarketingDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<"founder_pass" | "founders_pass">("founder_pass");

  const lang = currentLanguage as 'pt' | 'en' | 'es';
  const isLoggedIn = !!authData?.user;

  useEffect(() => {
    if (authData?.user?.id) {
      queryClient.invalidateQueries({ queryKey: ['subscription', authData.user.id] });
    }
  }, [authData?.user?.id]);

  useEffect(() => {
    if (!pixModalOpen && authData?.user?.id) {
      refreshSubscription();
    }
  }, [pixModalOpen]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Planos e Preços | Guilda - Encontre seu Co-fundador</title>
        <meta name="description" content="Comece grátis ou ganhe 6 meses de acesso Founder divulgando nas redes sociais. Planos a partir de R$ 39,90/mês para encontrar seu cofundador ideal." />
        <link rel="canonical" href="https://www.guilda.app.br/pricing" />
        <meta property="og:title" content="Planos e Preços | Guilda" />
        <meta property="og:description" content="Comece grátis ou ganhe 6 meses de acesso Founder divulgando nas redes sociais. Encontre seu cofundador ideal." />
        <meta property="og:url" content="https://www.guilda.app.br/pricing" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Planos e Preços - Guilda",
            "description": "Planos para encontrar seu cofundador ideal. Comece grátis.",
            "url": "https://www.guilda.app.br/pricing"
          })}
        </script>
      </Helmet>
      <LandingDarkNavbar />

      {/* Header */}
      <header className="pt-24 sm:pt-32 pb-8 sm:pb-12 text-center px-5">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#7610dc] mb-3 sm:mb-4">
          {lang === 'pt' ? 'Planos' : lang === 'es' ? 'Planes' : 'Pricing'}
        </p>
        <h1
          className="text-2xl sm:text-4xl md:text-6xl font-serif font-thin leading-[0.95] tracking-tight text-black mb-4 sm:mb-6 whitespace-pre-line"
          style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
        >
          {lang === 'pt' ? 'Encontre seu sócio.\nLance sua startup.' : lang === 'es' ? 'Encuentra tu socio.\nLanza tu startup.' : 'Find your co-founder.\nLaunch your startup.'}
        </h1>
        <p className="text-sm sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
          {lang === 'pt' 
            ? 'Comece grátis ou divulgue nas redes para virar Founder. Investimento menor que um café por dia.'
            : lang === 'es'
            ? 'Empieza gratis o comparte en redes para ser Founder. Inversión menor que un café al día.'
            : 'Start free or share on social media to become Founder. Investment less than a coffee per day.'}
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-4 lg:px-6 pb-16 sm:pb-24">
        <CreditPlansSection />
      </main>

      <LandingFooter />

      {/* Modals */}
      <PixPaymentModal
        open={pixModalOpen}
        onOpenChange={setPixModalOpen}
        productType={selectedProduct}
      />
      <SocialPaymentDialog 
        open={socialDialogOpen} 
        onOpenChange={setSocialDialogOpen} 
      />
      <SocialPaymentMarketingDialog
        open={marketingDialogOpen}
        onOpenChange={setMarketingDialogOpen}
      />
    </div>
  );
};

export default Pricing;
