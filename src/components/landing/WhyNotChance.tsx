import { Zap, Dna, Shield, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

export const WhyNotChance = () => {
  const { t } = useTranslation();

  const benefits = [
    { icon: Zap, title: t('landing.whyNotChance.benefit1Title'), desc: t('landing.whyNotChance.benefit1Desc'), accent: "#7610DC" },
    { icon: Dna, title: t('landing.whyNotChance.benefit2Title'), desc: t('landing.whyNotChance.benefit2Desc'), accent: "#7610DC" },
    { icon: Shield, title: t('landing.whyNotChance.benefit3Title'), desc: t('landing.whyNotChance.benefit3Desc'), accent: "#F97316" },
    { icon: Rocket, title: t('landing.whyNotChance.benefit4Title'), desc: t('landing.whyNotChance.benefit4Desc'), accent: "#7610DC" },
  ];

  return (
    <section className="py-10 sm:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2
            className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('landing.whyNotChance.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
            {t('landing.whyNotChance.description')}
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-8 border border-black/10 hover:border-[#7610DC]/30 transition-colors duration-300 text-left" style={{ borderLeft: `3px solid ${b.accent}` }}>
              <div className="w-12 h-12 rounded-xl border border-black/10 flex items-center justify-center">
                <b.icon className="w-6 h-6 text-[#7610DC]" />
              </div>
              <h3 className="text-lg font-bold text-black mt-4">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-[1.6] mt-2">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl px-4 py-5 border border-black/10 text-left" style={{ borderLeft: `2px solid ${b.accent}` }}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center">
                <b.icon className="w-5 h-5 text-[#7610DC]" />
              </div>
              <h3 className="text-[15px] font-bold text-black mt-3">{b.title}</h3>
              <p className="text-[12px] text-gray-500 leading-[1.6] mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
