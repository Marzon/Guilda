import { useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface CreditPlan {
  name: string;
  credits: number;
  totalPrice: number;
  highlighted: boolean;
  isFree?: boolean;
}

export const CreditPlansSection = () => {
  const { t, currentLanguage } = useLanguage();
  const lang = currentLanguage as "pt" | "en" | "es";

  const plans: CreditPlan[] = useMemo(
    () => [
      { name: lang === "pt" ? "Grátis" : lang === "es" ? "Gratis" : "Free", credits: 50, totalPrice: 0, highlighted: false, isFree: true },
      { name: "Starter", credits: 60, totalPrice: 193.8, highlighted: false },
      { name: "Pro", credits: 120, totalPrice: 320.4, highlighted: true },
      { name: "Scale", credits: 230, totalPrice: 483.0, highlighted: false },
    ],
    [lang]
  );

  const buyLabel =
    lang === "pt" ? "Comprar Créditos" : lang === "es" ? "Comprar Créditos" : "Buy Credits";

  const freeLabel =
    lang === "pt" ? "Começar Grátis" : lang === "es" ? "Empezar Gratis" : "Start Free";

  const badgeLabel =
    lang === "pt"
      ? "Melhor Custo-Benefício"
      : lang === "es"
      ? "Mejor Costo-Beneficio"
      : "Best Value";

  const sectionTitle =
    lang === "pt"
      ? "Pacotes de Créditos"
      : lang === "es"
      ? "Paquetes de Créditos"
      : "Credit Packs";

  const sectionSubtitle =
    lang === "pt"
      ? "Use créditos para funcionalidades avançadas de IA, validações e muito mais."
      : lang === "es"
      ? "Usa créditos para funcionalidades avanzadas de IA, validaciones y más."
      : "Use credits for advanced AI features, validations and more.";

  const creditsLabel =
    lang === "pt" ? "créditos" : lang === "es" ? "créditos" : "credits";

  return (
    <section className="mt-10 sm:mt-20 mb-12">
      <div className="text-center mb-8 sm:mb-10 px-2">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#7610dc] mb-2 sm:mb-3">
          {sectionTitle}
        </p>
        <h2
          className="text-xl sm:text-3xl md:text-4xl font-serif font-thin leading-[0.95] tracking-tight text-black mb-2 sm:mb-3"
          style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
        >
          {sectionTitle}
        </h2>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">{sectionSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl lg:rounded-[2rem] p-4 sm:p-6 lg:p-8 transition-all ${
              plan.highlighted
                ? "border-2 border-[#7610dc] relative lg:scale-[1.02]"
                : "border border-black/10"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                {badgeLabel}
              </div>
            )}

            <div className={plan.highlighted ? "mt-1 sm:mt-2" : ""}>
              <h3 className="text-base sm:text-xl font-bold text-black mb-0.5 sm:mb-1">{plan.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-6">
                {plan.credits} {creditsLabel}
              </p>

              <div className="mb-3 sm:mb-6">
                <span
                  className="text-2xl sm:text-4xl font-thin text-black"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  {plan.isFree
                    ? (lang === "pt" ? "Grátis" : lang === "es" ? "Gratis" : "Free")
                    : `R$ ${plan.totalPrice.toFixed(2).replace(".", ",")}`}
                </span>
              </div>

              <Button
                asChild
                className={`w-full py-2.5 sm:py-4 rounded-xl font-bold text-sm sm:text-lg ${
                  plan.isFree
                    ? "bg-black hover:bg-black/90 text-white"
                    : plan.highlighted
                    ? "bg-[#7610dc] hover:bg-[#7610dc]/90 text-white"
                    : "bg-black hover:bg-black/90 text-white"
                }`}
              >
                <a href="https://suprema.guilda.app.br/" target="_blank" rel="noopener noreferrer">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">{plan.isFree ? freeLabel : buyLabel}</span>
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
