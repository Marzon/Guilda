import { Card } from "@/components/ui/card";
import { Sparkles, LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface TutorialSlide {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

export const TutorialStep = () => {
  const { t } = useLanguage();

  const tutorialSlides: TutorialSlide[] = [
    {
      icon: Sparkles,
      title: t('onboarding.tutorialTavern'),
      description: t('onboarding.tutorialTavernDesc'),
      features: [
        t('onboarding.tutorialFeature1'),
        t('onboarding.tutorialFeature2'),
        t('onboarding.tutorialFeature3'),
      ]
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1 sm:mb-2">
          {t('onboarding.tutorial')}
        </h1>
      </div>

      {tutorialSlides.map((slide, index) => {
        const Icon = slide.icon;
        return (
          <Card key={index} className="glass border-2 border-primary/20 p-4 sm:p-8">
            <div className="flex flex-col items-center gap-3 sm:gap-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-primary/10">
                <Icon className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl font-display font-bold">
                  {slide.title}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg">
                  {slide.description}
                </p>
              </div>

              {/* Features - Always visible, compact on mobile */}
              <div className="w-full space-y-1.5 sm:space-y-2">
                {slide.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-left">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-xs sm:text-sm leading-tight">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
