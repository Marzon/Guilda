import { Card } from "@/components/ui/card";
import { Hammer, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ArchetypeStepProps {
  archetype: "BUILDER" | "SELLER" | "INVESTOR" | "STARTER" | null;
  setArchetype: (value: "BUILDER" | "SELLER" | "INVESTOR" | "STARTER") => void;
}

export const ArchetypeStep = ({ archetype, setArchetype }: ArchetypeStepProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 sm:space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1 sm:mb-2">
          {t('onboarding.chooseClass')}
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* Builder */}
        <Card
          className={`glass p-3 sm:p-6 cursor-pointer transition-all border-2 ${
            archetype === "BUILDER"
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => setArchetype("BUILDER")}
        >
          <div className="text-center space-y-2 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10">
              <Hammer className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-sm sm:text-lg font-display font-bold">
              <span className="hidden sm:inline">🔨 </span>{t('onboarding.builder')}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block leading-tight">
              {t('onboarding.builderDesc')}
            </p>
          </div>
        </Card>

        {/* Seller */}
        <Card
          className={`glass p-3 sm:p-6 cursor-pointer transition-all border-2 ${
            archetype === "SELLER"
              ? "border-accent shadow-lg shadow-accent/20"
              : "border-border hover:border-accent/50"
          }`}
          onClick={() => setArchetype("SELLER")}
        >
          <div className="text-center space-y-2 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/10">
              <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
            </div>
            <h3 className="text-sm sm:text-lg font-display font-bold">
              <span className="hidden sm:inline">💰 </span>{t('onboarding.seller')}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block leading-tight">
              {t('onboarding.sellerDesc')}
            </p>
          </div>
        </Card>

        {/* Investor */}
        <Card
          className={`glass p-3 sm:p-6 cursor-pointer transition-all border-2 ${
            archetype === "INVESTOR"
              ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
              : "border-border hover:border-emerald-500/50"
          }`}
          onClick={() => setArchetype("INVESTOR")}
        >
          <div className="text-center space-y-2 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/10">
              <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-500" />
            </div>
            <h3 className="text-sm sm:text-lg font-display font-bold">
              <span className="hidden sm:inline">💵 </span>{t('onboarding.investor')}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block leading-tight">
              {t('onboarding.investorDesc')}
            </p>
          </div>
        </Card>

        {/* Starter */}
        <Card
          className={`glass p-3 sm:p-6 cursor-pointer transition-all border-2 ${
            archetype === "STARTER"
              ? "border-purple-500 shadow-lg shadow-purple-500/20"
              : "border-border hover:border-purple-500/50"
          }`}
          onClick={() => setArchetype("STARTER")}
        >
          <div className="text-center space-y-2 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-500/10">
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-purple-500" />
            </div>
            <h3 className="text-sm sm:text-lg font-display font-bold">
              <span className="hidden sm:inline">✨ </span>{t('onboarding.starter')}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block leading-tight">
              {t('onboarding.starterDesc')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
