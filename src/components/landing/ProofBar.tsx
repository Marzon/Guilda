import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";

function useCountUp(target: number, duration: number, isVisible: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target, duration]);
  return count;
}

const FALLBACK_COUNT = 600;

export const ProofBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { data: stats, isLoading } = usePlatformStats();
  const founderTarget = stats?.total_profiles || FALLBACK_COUNT;
  const count = useCountUp(founderTarget, 1500, isVisible);
  const { t } = useTranslation();

  const supportMetrics = [
    { value: "94%", label: t('landing.proofBar.matchRate') },
    { value: "15 dias", label: t('landing.proofBar.matchToMvp') },
    { value: "R$0", label: t('landing.proofBar.toStart') },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#7610DC] py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="hidden md:flex items-center justify-center gap-14">
          <div className="flex flex-col items-center text-center">
            <span className="text-[48px] font-serif font-thin text-white leading-none" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>+{count}</span>
            <span className="text-[14px] uppercase tracking-[1px] text-white/70 mt-1">{t('landing.proofBar.foundersLabel')}</span>
          </div>
          <div className="w-[1px] h-10 bg-white/20" />
          {supportMetrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center text-center">
              <span className="text-2xl font-serif font-thin text-white leading-none" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>{m.value}</span>
              <span className="text-[12px] uppercase tracking-[1px] text-white/60 mt-1">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="md:hidden grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-serif font-thin text-white leading-none" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>+{count}</span>
            <span className="text-[11px] uppercase tracking-[1px] text-white/70 mt-1">{t('landing.proofBar.foundersLabelShort')}</span>
          </div>
          {supportMetrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center text-center">
              <span className="text-2xl font-serif font-thin text-white leading-none" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>{m.value}</span>
              <span className="text-[11px] uppercase tracking-[1px] text-white/60 mt-1">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
