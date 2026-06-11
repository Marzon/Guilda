import { useRef, useState, useEffect } from "react";
import { Swords, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export const CommanderCardsPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  const builderSkills = [
    { name: "Backend", value: 90 },
    { name: "Frontend", value: 70 },
    { name: "IA/ML", value: 60 },
  ];
  const sellerSkills = [
    { name: "Growth", value: 85 },
    { name: t('landing.commanderCards.salesB2B'), value: 80 },
    { name: t('landing.commanderCards.product'), value: 50 },
  ];

  const builderTags = ["Backend", "Frontend", "IA/ML"];
  const sellerTags = ["Growth", t('landing.commanderCards.salesB2B'), t('landing.commanderCards.product')];

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setIsVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-12 sm:py-32 px-4 overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <span className="inline-block border border-gray-200 text-[#7610DC] text-sm font-medium rounded-full px-4 py-1.5 mb-6">
            {t('landing.commanderCards.badge')}
          </span>
          <h2
            className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('landing.commanderCards.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
            {t('landing.commanderCards.description')}
          </p>
        </div>

        {/* MOBILE */}
        <div className="md:hidden relative grid grid-cols-2 gap-3 max-w-3xl mx-auto">
          <MiniCard type="builder" badge="BUILDER" name="Lucas M." desc="Dev Full-Stack · Python · React" tags={builderTags} visible={isVisible} direction="left" />
          <MiniCard type="seller" badge="SELLER" name="Ana R." desc="Growth Marketing · B2B SaaS" tags={sellerTags} visible={isVisible} direction="right" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center">
            <Swords className="text-[#7610DC]" size={18} />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block relative max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            <FullCard
              type="builder" badge="BUILDER" name="Lucas M." desc="Dev Full-Stack · Python · React"
              skills={builderSkills}
              search={t('landing.commanderCards.builderSearch')}
              availability={t('landing.commanderCards.builderAvail')}
              matches={3} visible={isVisible} direction="left"
              powersLabel={t('landing.commanderCards.powers')}
              searchLabel={t('landing.commanderCards.search')}
              availabilityLabel={t('landing.commanderCards.availability')}
              matchesLabel={t('landing.commanderCards.matchesFound')}
            />
            <FullCard
              type="seller" badge="SELLER" name="Ana R." desc="Growth Marketing · B2B SaaS"
              skills={sellerSkills}
              search={t('landing.commanderCards.sellerSearch')}
              availability={t('landing.commanderCards.sellerAvail')}
              matches={5} visible={isVisible} direction="right"
              powersLabel={t('landing.commanderCards.powers')}
              searchLabel={t('landing.commanderCards.search')}
              availabilityLabel={t('landing.commanderCards.availability')}
              matchesLabel={t('landing.commanderCards.matchesFound')}
            />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center">
            <Swords className="text-[#7610DC]" size={20} />
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          {t('landing.commanderCards.footer')}
        </p>
      </div>
    </section>
  );
};

interface MiniCardProps { type: "builder" | "seller"; badge: string; name: string; desc: string; tags: string[]; visible: boolean; direction?: "left" | "right"; }

const MiniCard = ({ type, badge, name, desc, tags, visible, direction = "left" }: MiniCardProps) => {
  const isBuilder = type === "builder";
  const cardBg = isBuilder ? "#7610DC" : "#F97316";
  const translateFrom = direction === "left" ? "translateX(-60px)" : "translateX(60px)";
  return (
    <div className="rounded-2xl p-4 transition-all duration-300" style={{ backgroundColor: cardBg, opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : translateFrom, transition: "opacity 0.7s ease-out, transform 0.7s ease-out" }}>
      <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 bg-white" style={{ color: cardBg }}>{badge}</span>
      <h3 className="text-white font-bold text-lg mb-0.5">{name}</h3>
      <p className="text-white/75 text-xs line-clamp-1 mb-3">{desc}</p>
      <div className="flex flex-col gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded-md font-medium bg-white/15 text-white border border-white/25 text-center">{tag}</span>
        ))}
      </div>
    </div>
  );
};

interface FullCardProps { type: "builder" | "seller"; badge: string; name: string; desc: string; skills: { name: string; value: number }[]; search: string; availability: string; matches: number; visible: boolean; direction?: "left" | "right"; powersLabel: string; searchLabel: string; availabilityLabel: string; matchesLabel: string; }

const FullCard = ({ type, badge, name, desc, skills, search, availability, matches, visible, direction = "left", powersLabel, searchLabel, availabilityLabel, matchesLabel }: FullCardProps) => {
  const isBuilder = type === "builder";
  const cardBg = isBuilder ? "#7610DC" : "#F97316";
  const translateFrom = direction === "left" ? "translateX(-80px)" : "translateX(80px)";
  return (
    <div className="rounded-2xl p-6 lg:p-8 transition-all duration-300" style={{ backgroundColor: cardBg, opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : translateFrom, transition: "opacity 0.8s ease-out, transform 0.8s ease-out" }}>
      <span className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 bg-white" style={{ color: cardBg }}>{badge}</span>
      <h3 className="text-white font-bold text-xl lg:text-2xl mb-1">{name}</h3>
      <p className="text-white/75 text-sm mb-5">{desc}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-white/50">{powersLabel}</p>
      <div className="space-y-3 mb-5">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">{skill.name}</span>
              <span className="text-white font-semibold">{skill.value}%</span>
            </div>
            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-white" style={{ width: visible ? `${skill.value}%` : "0%", transition: "width 1s ease-out 0.3s" }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-white/50">{searchLabel}</p>
      <p className="text-sm text-white mb-5">{search}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-white/50">{availabilityLabel}</p>
      <p className="text-sm text-white mb-5 flex items-center gap-1.5"><Zap size={14} className="text-white" />{availability}</p>
      <div className="border-t border-white/15 pt-4">
        <p className="text-sm font-medium flex items-center gap-1.5 text-white"><Swords size={14} />{matches} {matchesLabel}</p>
      </div>
    </div>
  );
};
