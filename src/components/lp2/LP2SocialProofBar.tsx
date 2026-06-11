import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import supzLogo from "@/assets/logos/supz.jpg";
import divamarketLogo from "@/assets/logos/divamarket.png";
import ijobaLogo from "@/assets/logos/ijoba.png";
import sourmizeLogo from "@/assets/logos/sourmize.png";
import metrikiaLogo from "@/assets/logos/metrikia.png";
import certiflinkLogo from "@/assets/logos/certiflink.png";

const STARTUPS = [
  { name: "Supz", logo: supzLogo },
  { name: "Diva Market", logo: divamarketLogo },
  { name: "Ìjọba", logo: ijobaLogo },
  { name: "Sourmize", logo: sourmizeLogo },
  { name: "Metrikia", logo: metrikiaLogo },
  { name: "Certiflink", logo: certiflinkLogo },
];

const LogoItem = ({ name, logo }: { name: string; logo: string }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex items-center gap-2.5 px-4 flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-[400ms]">
      {failed ? (
        <div className="w-10 h-10 rounded-lg bg-lp2-border flex-shrink-0" />
      ) : (
        <img
          src={logo}
          alt={name}
          loading="lazy"
          width={53}
          height={53}
          style={{ maxWidth: 53, maxHeight: 53 }}
          className="h-8 w-auto object-contain flex-shrink-0"
          onError={() => setFailed(true)}
        />
      )}
      <span className="text-lp2-text-muted text-sm font-medium whitespace-nowrap">
        {name}
      </span>
    </div>
  );
};

const LP2SocialProofBar = () => {
  const isMobile = useIsMobile();

  return (
    <section
      className="relative overflow-hidden bg-lp2-bg border-y border-lp2-border py-4"
    >
      <div className="flex flex-col items-center gap-4">
        <p className="font-sans text-lp2-text-muted text-xs font-semibold uppercase tracking-[0.2em] text-center">
          Startups formadas por co-founders na Guilda
        </p>

        <div className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-lp2-bg to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-lp2-bg to-transparent" />

          {isMobile ? (
            <div className="flex animate-marquee" style={{ gap: 40, width: "max-content" }}>
              {STARTUPS.map((s) => <LogoItem key={s.name} {...s} />)}
              {STARTUPS.map((s) => <LogoItem key={`dup-${s.name}`} {...s} />)}
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ gap: 40 }}>
              {STARTUPS.map((s) => <LogoItem key={s.name} {...s} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LP2SocialProofBar;
