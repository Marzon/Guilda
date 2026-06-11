import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MessageSquare, Swords, Rocket, ArrowRight } from "lucide-react";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { useTranslation } from "react-i18next";

const CORE_APP_URL = "https://suprema.guilda.app.br";

export const HowItWorks = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractingRef = useRef(false);
  const { t } = useTranslation();

  const steps = useMemo(() => [
    { number: "01", title: t('landing.howItWorksSteps.step1Title'), description: t('landing.howItWorksSteps.step1Desc') },
    { number: "02", title: t('landing.howItWorksSteps.step2Title'), description: t('landing.howItWorksSteps.step2Desc') },
    { number: "03", title: t('landing.howItWorksSteps.step3Title'), description: t('landing.howItWorksSteps.step3Desc') },
  ], [t]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement;
    if (!card) return;
    const containerPadding = 32;
    const scrollPos = card.offsetLeft - containerPadding;
    el.scrollTo({ left: scrollPos, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth || 260;
      const gap = 16;
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(Math.max(index, 0), 2));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (userInteractingRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % 3;
        scrollToIndex(next);
        return next;
      });
    }, 4000);
  }, [scrollToIndex]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [startAutoplay]);

  const handleUserInteraction = useCallback(() => {
    userInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      userInteractingRef.current = false;
    }, 6000);
  }, []);

  const handleDotClick = useCallback((i: number) => {
    handleUserInteraction();
    setActiveIndex(i);
    scrollToIndex(i);
  }, [scrollToIndex, handleUserInteraction]);

  return (
    <section id="como-funciona" className="py-10 sm:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-10">
          <h2
            className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('landing.howItWorks.title')} {t('landing.howItWorks.titleHighlight')}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block relative">
          <div
            className="absolute top-1/2 left-[16.66%] right-[16.66%] -translate-y-1/2 border-t-2 border-dashed border-[#7610DC]/20 z-0"
          />
          <div className="grid grid-cols-3 gap-6 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-8 border border-black/10 hover:border-[#7610DC]/30 transition-colors duration-300 text-center flex flex-col items-center"
              >
                <span className="text-[48px] font-serif font-thin leading-none select-none text-[#7610DC]" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>
                  {step.number}
                </span>
                <h3 className="text-lg font-bold text-black mt-4">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-[1.5] mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <style>{`.how-carousel::-webkit-scrollbar { display: none; }`}</style>
          <div
            ref={scrollRef}
            className="how-carousel flex gap-4 overflow-x-auto snap-x snap-mandatory px-8 pb-2"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            onTouchStart={handleUserInteraction}
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="snap-center bg-white rounded-2xl border border-black/10 flex flex-col items-center text-center"
                style={{ minWidth: 'calc(100vw - 64px)', width: 'calc(100vw - 64px)', flexShrink: 0, padding: '28px 24px', height: 'auto' }}
              >
                <span className="text-[32px] font-serif font-thin leading-none select-none text-[#7610DC]" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>
                  {step.number}
                </span>
                <h3 className="text-base font-bold text-black mt-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', WebkitLineClamp: 'unset', display: 'block', maxHeight: 'none', wordWrap: 'break-word' }}>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 mt-4">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                aria-label={`Step ${i + 1}`}
                className="transition-all duration-300 ease-in-out"
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  borderRadius: i === activeIndex ? 4 : '50%',
                  backgroundColor: i === activeIndex ? '#7610DC' : '#D1D5DB',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href={buildCoreAppUrl(CORE_APP_URL, "/auth?view=signup")}
            className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold text-base rounded-xl px-8 py-4 transition-colors duration-300 w-full sm:w-auto max-w-[400px] mx-auto"
          >
            {t('landing.howItWorksSteps.cta')} <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-gray-400 text-sm text-center">{t('landing.howItWorksSteps.ctaSubtitle')}</p>
        </div>
      </div>
    </section>
  );
};
