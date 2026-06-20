import { MessageSquare, Sparkles, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function MvpBuilderCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = [
    { icon: MessageSquare, title: t('landing.mvpBuilder.step1'), titleMobile: t('landing.mvpBuilder.step1Mobile'), description: t('landing.mvpBuilder.step1Desc') },
    { icon: Sparkles, title: t('landing.mvpBuilder.step2'), titleMobile: t('landing.mvpBuilder.step2Mobile'), description: t('landing.mvpBuilder.step2Desc') },
    { icon: Rocket, title: t('landing.mvpBuilder.step3'), titleMobile: t('landing.mvpBuilder.step3Mobile'), description: t('landing.mvpBuilder.step3Desc') },
  ];

  const handleCTA = () => {
    navigate("/ferramentas-empreendedores/guilda-ia-mvp");
  };

  return (
    <section className="bg-[#0a0b24] py-12 sm:py-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        <span className="inline-block border border-white/20 text-white text-sm font-medium rounded-full px-4 py-1.5">
          {t('landing.mvpBuilder.badge')}
        </span>

        <h2
          className="mt-6 text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-white"
          style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
        >
          {t('landing.mvpBuilder.title')}
        </h2>

        <p className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl">
          {t('landing.mvpBuilder.description')}
        </p>

        {/* Desktop cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mt-12 w-full">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-colors duration-300 text-left">
              <div className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center">
                <step.icon className="w-7 h-7 text-[#7610DC]" />
              </div>
              <h3 className="text-xl font-semibold text-white mt-2 mb-2">{step.title}</h3>
              <p className="text-[15px] text-white/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile steps */}
        <div className="md:hidden mt-12 w-full">
          <div className="grid grid-cols-3 gap-3 px-4">
            {steps.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-[#7610DC]" />
                </div>
                <h4 className="text-xs font-bold text-white mt-2 leading-tight">{step.titleMobile}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Button onClick={handleCTA} size="lg" className="w-full sm:w-auto max-w-[400px] mx-auto bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold text-base rounded-xl px-8 py-4 h-auto transition-colors duration-200">
            {t('landing.mvpBuilder.cta')} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-white/60 text-xs mt-2 text-center">{t('landing.mvpBuilder.ctaSubtitle')}</p>
        </div>
      </div>
    </section>
  );
}
