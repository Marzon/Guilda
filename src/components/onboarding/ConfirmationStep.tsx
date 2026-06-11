import { Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const ConfirmationStep = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 sm:space-y-6 animate-fade-in text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-2 sm:mb-4">
        <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-display font-bold">
        {t('onboarding.readyToStart')}
      </h1>
      
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
        {t('onboarding.readyDesc')}
      </p>
    </div>
  );
};
