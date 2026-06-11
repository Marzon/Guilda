import { useState } from "react";
import { useTranslation } from "react-i18next";

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
    <div className="flex items-center gap-2.5 px-4 flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 md:grayscale md:opacity-50 md:hover:grayscale-0 md:hover:opacity-100 max-md:grayscale-0 max-md:opacity-100 transition-all duration-[400ms]">
      {failed ? (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
      ) : (
        <img src={logo} alt={name} className="h-8 w-auto object-contain flex-shrink-0" onError={() => setFailed(true)} />
      )}
      <span className="text-gray-400 text-sm font-medium whitespace-nowrap">{name}</span>
    </div>
  );
};

export const SocialProof = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white pt-8 pb-12 sm:pt-4 sm:pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-8">
          {t('landing.socialProof.title')}
        </p>
        <div className="hidden md:flex flex-wrap items-center justify-center gap-8">
          {STARTUPS.map((s) => <LogoItem key={s.name} {...s} />)}
        </div>
        <div className="md:hidden overflow-hidden">
          <div className="flex animate-marquee w-max">
            {[...STARTUPS, ...STARTUPS].map((s, i) => <LogoItem key={`${s.name}-${i}`} {...s} />)}
          </div>
        </div>
      </div>
    </section>
  );
};
