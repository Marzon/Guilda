import { Button } from "@/components/ui/button";
import { Scissors, Hammer, Rocket, ArrowRight, Flame, Zap, Calendar } from "lucide-react";
import { useCohorts } from "@/hooks/useCohorts";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const AccelerationSection = () => {
  const { t } = useTranslation();
  const { openCohorts } = useCohorts();

  const phases = [
    { icon: Scissors, nameKey: "phase1", name: "Match", days: "D1-3", color: "text-red-500", description: t('landing.accelerationSection.phase1Desc') },
    { icon: Hammer, nameKey: "phase2", name: "Build", days: "D4-10", color: "text-amber-500", description: t('landing.accelerationSection.phase2Desc') },
    { icon: Rocket, nameKey: "phase3", name: "Launch", days: "D11-15", color: "text-orange-500", description: t('landing.accelerationSection.phase3Desc') },
  ];

  const activeCohort = openCohorts?.[0];
  const enrolledCount = activeCohort?.members_count || 0;
  const maxSlots = activeCohort?.max_slots || 30;
  const remainingSlots = maxSlots - enrolledCount;

  const handleClick = () => {
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  };

  return (
    <section className="relative overflow-hidden bg-[#0a0b24] py-12 sm:py-32 -mt-px">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-block border border-[#F97316]/30 text-[#F97316] text-sm font-medium rounded-full px-4 py-1.5 mb-6">
            {t('landing.accelerationSection.badge')}
          </span>
          <h2
            className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-white mb-2"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('landing.accelerationSection.title')}
          </h2>
          <p className="text-xl sm:text-2xl font-serif font-thin text-[#F97316] tracking-tight mt-2" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>
            {t('landing.accelerationSection.subtitle')}
          </p>
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mt-4">
            {t('landing.accelerationSection.description')}
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="hidden sm:block">
            <div className="flex items-start justify-between relative">
              {phases.map((phase) => (
                <div key={phase.name} className="flex flex-col items-center text-center flex-1 relative z-10">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mb-4">
                    <phase.icon className={`w-7 h-7 ${phase.color}`} />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {t(`landing.acceleration.${phase.nameKey}`, phase.name)}
                  </span>
                  <span className="text-xs text-white/50 mt-1">{phase.days}</span>
                  <p className="text-xs text-white/60 mt-2 max-w-[160px] leading-snug">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:hidden grid grid-cols-3 gap-3">
            {phases.map((phase) => (
              <div key={phase.name} className="flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center mb-2">
                  <phase.icon className={`w-5 h-5 ${phase.color}`} />
                </div>
                <span className="text-[13px] font-bold text-white">{t(`landing.acceleration.${phase.nameKey}`, phase.name)}</span>
                <span className="text-[11px] text-white/50 mt-0.5">{phase.days}</span>
                <p className="text-[12px] leading-[1.4] text-white/60 mt-1.5">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - só aparece quando tem turma aberta */}
        {activeCohort && (
          <div className="text-center">
            <div className="mb-8 space-y-4">
              <Badge className="bg-[#7610DC] text-white border-0 text-sm px-4 py-2 rounded-full hover:bg-[#7610DC]/90">
                <Calendar className="w-4 h-4 mr-2" />
                {activeCohort.name} - {t('landing.acceleration.openEnrollment')}
              </Badge>

              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">{t('landing.accelerationSection.slotsFilled')}</span>
                  <span className="text-red-400 font-semibold">{enrolledCount}/{maxSlots}</span>
                </div>
                <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F97316] rounded-full transition-all duration-1000" style={{ width: `${(enrolledCount / maxSlots) * 100}%` }} />
                </div>
                {remainingSlots <= 10 && (
                  <p className="text-red-400 text-sm mt-2 flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" /> {t('landing.accelerationSection.slotsRemaining', { count: remainingSlots })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <Button onClick={handleClick} size="lg" className="w-full sm:w-auto max-w-[400px] mx-auto bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 h-auto rounded-xl transition-colors duration-200">
                <Flame className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{t('landing.accelerationSection.cta')}</span>
                <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
              </Button>

              <p className="text-white/50 text-sm">{t('landing.accelerationSection.ctaSubtitle')}</p>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                <div className="text-center">
                  <p className="text-2xl font-serif font-thin text-white" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>94%</p>
                  <p className="text-xs text-white/50">{t('landing.accelerationSection.kpiMatchRate')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-thin text-white" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>3 {t('landing.accelerationSection.kpiSavings')}</p>
                  <p className="text-xs text-white/50">{t('landing.accelerationSection.kpiSavings')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-thin text-white" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>6 {t('landing.accelerationSection.kpiFreeApp')}</p>
                  <p className="text-xs text-white/50">{t('landing.accelerationSection.kpiFreeApp')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
