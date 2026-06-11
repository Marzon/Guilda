import { Helmet } from "react-helmet-async";
import { Aceleracao2Navbar } from "@/components/aceleracao2/Aceleracao2Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import Aceleracao2Hero from "@/components/aceleracao2/Aceleracao2Hero";
import Aceleracao2Problem from "@/components/aceleracao2/Aceleracao2Problem";
import Aceleracao2HowItWorks from "@/components/aceleracao2/Aceleracao2HowItWorks";
import Aceleracao2Benefits from "@/components/aceleracao2/Aceleracao2Benefits";
import Aceleracao2ForWhom from "@/components/aceleracao2/Aceleracao2ForWhom";
import Aceleracao2Protocol from "@/components/aceleracao2/Aceleracao2Protocol";
import Aceleracao2SocialProof from "@/components/aceleracao2/Aceleracao2SocialProof";
import Aceleracao2CTAFinal from "@/components/aceleracao2/Aceleracao2CTAFinal";

const Aceleracao2 = () => {
  return (
    <>
      <Helmet>
        <title>Aceleração de Startups: Do Zero ao MVP em 15 Dias | Guilda</title>
        <meta 
          name="description" 
          content="Programa de aceleração gamificado para co-founders. Encontre seu sócio, construa o MVP e valide com receita real em 15 dias. Para Builders e Sellers." 
        />
        <meta name="keywords" content="aceleração de startups, programa aceleração, MVP em 15 dias, encontrar cofundador, acelerar startup, do zero ao MVP" />
        <link rel="canonical" href="https://www.guilda.app.br/aceleracao" />
        <meta property="og:title" content="Aceleração de Startups: Do Zero ao MVP em 15 Dias | Guilda" />
        <meta property="og:description" content="Programa de aceleração gamificado para co-founders. Encontre seu sócio, construa o MVP e valide com receita real em 15 dias." />
        <meta property="og:url" content="https://www.guilda.app.br/aceleracao" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
      </Helmet>
      
      <div className="min-h-screen bg-[#FFFBF7] text-[#0A0B24]">
        <Aceleracao2Navbar />
        
        <main>
          <Aceleracao2Hero />
          <Aceleracao2Problem />
          <Aceleracao2HowItWorks />
          <Aceleracao2Benefits />
          <Aceleracao2ForWhom />
          <Aceleracao2Protocol />
          <Aceleracao2SocialProof />
          <Aceleracao2CTAFinal />
        </main>
        
        <LandingFooter />
      </div>
    </>
  );
};

export default Aceleracao2;
