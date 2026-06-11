import { Helmet } from "react-helmet-async";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";
import DoOrDieHero from "@/components/doOrDie/DoOrDieHero";
import DoOrDieProblem from "@/components/doOrDie/DoOrDieProblem";
import DoOrDieSolution from "@/components/doOrDie/DoOrDieSolution";
import DoOrDieAgents from "@/components/doOrDie/DoOrDieAgents";
import DoOrDieAudience from "@/components/doOrDie/DoOrDieAudience";
import DoOrDieProtocol from "@/components/doOrDie/DoOrDieProtocol";
import DoOrDieBeforeAfter from "@/components/doOrDie/DoOrDieBeforeAfter";
import DoOrDieTestimonials from "@/components/doOrDie/DoOrDieTestimonials";
import DoOrDieSocialProof from "@/components/doOrDie/DoOrDieSocialProof";
import DoOrDieFAQ from "@/components/doOrDie/DoOrDieFAQ";
import DoOrDieCTA from "@/components/doOrDie/DoOrDieCTA";
import DoOrDieStickyBar from "@/components/doOrDie/DoOrDieStickyBar";

const DoOrDie = () => {
  return (
    <>
      <Helmet>
        <title>Aceleração: De Ideia a MVP em 15 Dias | Guilda</title>
        <meta 
          name="description" 
          content="O programa de aceleração gamificado para Builders e Sellers. Encontre seu co-fundador, construa um MVP e valide com receita real em apenas 15 dias." 
        />
        <link rel="canonical" href="https://www.guilda.app.br/aceleracao" />
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <LandingNavbar />
        <SocialPaymentBanner />
        
        <main>
          <DoOrDieHero />
          <DoOrDieProblem />
          <DoOrDieSolution />
          <DoOrDieAgents />
          <DoOrDieAudience />
          <DoOrDieProtocol />
          <DoOrDieBeforeAfter />
          <DoOrDieTestimonials />
          <DoOrDieSocialProof />
          <DoOrDieFAQ />
          <DoOrDieCTA />
        </main>
        
        <LandingFooter />
        <DoOrDieStickyBar />
      </div>
    </>
  );
};

export default DoOrDie;
