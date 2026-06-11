import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import {
  HeroSection,
  SocialProof,
  LandingDarkNavbar,
  ProofBar,
} from "@/components/landing";

import { MktBannerDisplay } from "@/components/banners/MktBanner";

// Lazy load below-fold sections for better TTI
const CommanderCardsPreview = lazy(() => import("@/components/landing/CommanderCardsPreview").then(m => ({ default: m.CommanderCardsPreview })));
const MvpBuilderCTA = lazy(() => import("@/components/landing/MvpBuilderCTA").then(m => ({ default: m.MvpBuilderCTA })));
const AccelerationSection = lazy(() => import("@/components/landing/AccelerationSection").then(m => ({ default: m.AccelerationSection })));
const TestimonialsCarousel = lazy(() => import("@/components/landing/TestimonialsCarousel").then(m => ({ default: m.TestimonialsCarousel })));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks").then(m => ({ default: m.HowItWorks })));
const WhyNotChance = lazy(() => import("@/components/landing/WhyNotChance").then(m => ({ default: m.WhyNotChance })));
const SuccessStoriesSection = lazy(() => import("@/components/landing/SuccessStoriesSection").then(m => ({ default: m.SuccessStoriesSection })));
const ToolsShowcase = lazy(() => import("@/components/landing/ToolsShowcase").then(m => ({ default: m.ToolsShowcase })));
const LandingFAQ = lazy(() => import("@/components/landing/LandingFAQ").then(m => ({ default: m.LandingFAQ })));
const FinalCTA = lazy(() => import("@/components/landing/FinalCTA").then(m => ({ default: m.FinalCTA })));
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter").then(m => ({ default: m.LandingFooter })));

const Index = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Helmet>
        <title>Guilda - Encontre seu Co-fundador | Comunidade de Builders &amp; Sellers para Startups</title>
        <meta name="description" content="Encontre o co-fundador ideal para sua startup. A Guilda conecta desenvolvedores (Builders) e profissionais de vendas (Sellers) com match por compatibilidade. Do zero ao MVP em 15 dias." />
        <meta name="keywords" content="encontrar cofundador, achar sócio para startup, co-founder, comunidade de cofounders, networking empreendedores, projetos para desenvolvedores equity, oportunidades growth hackers startups, validar ideia de negócio, sair da ideia para o MVP, tech cofounder, parceiro de negócios" />
        <link rel="canonical" href="https://www.guilda.app.br/" />
        <meta property="og:title" content="Guilda - Encontre seu Co-fundador | Builders & Sellers" />
        <meta property="og:description" content="Encontre o co-fundador ideal para sua startup. Match por compatibilidade entre devs e profissionais de negócios. Do zero ao MVP em 15 dias." />
        <meta property="og:url" content="https://www.guilda.app.br/" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
        <meta name="twitter:title" content="Guilda - Encontre seu Co-fundador | Builders & Sellers" />
        <meta name="twitter:description" content="Encontre o co-fundador ideal para sua startup. Match por compatibilidade entre devs e profissionais de negócios." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Guilda - Encontre seu Co-fundador Ideal para Startup",
            "description": "Plataforma de co-founding que conecta Builders (desenvolvedores) e Sellers (profissionais de negócios) para formarem startups. Match por compatibilidade de habilidades.",
            "url": "https://www.guilda.app.br/",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Guilda",
              "url": "https://www.guilda.app.br"
            }
          })}
        </script>
      </Helmet>
      <LandingDarkNavbar />
      
      <MktBannerDisplay type="top_bar" />
      <MktBannerDisplay type="modal" />
      <HeroSection />
      <ProofBar />
      <SocialProof />
      <Suspense fallback={null}>
        <CommanderCardsPreview />
        <MvpBuilderCTA />
        <AccelerationSection />
        <TestimonialsCarousel page="home" />
        <HowItWorks />
        <WhyNotChance />
        <SuccessStoriesSection />
        <ToolsShowcase />
        <LandingFAQ />
        <FinalCTA />
        <LandingFooter />
      </Suspense>
    </div>
  );
};

export default Index;
