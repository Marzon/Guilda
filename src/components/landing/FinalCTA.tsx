import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const SUPREMA_PRO_URL = "https://suprema.guilda.app.br/pro";

export const FinalCTA = () => {
  const { t } = useTranslation();

  const handleClick = () => {
    window.location.href = SUPREMA_PRO_URL;
  };

  return (
    <section className="bg-white py-16 sm:py-24 border-t border-black/5">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2
          className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
          style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
        >
          {t('landing.finalCta.title', 'Pronto para criar, validar e escalar sua startup?')}
        </h2>
        <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 leading-relaxed max-w-xl mx-auto">
          {t('landing.finalCta.description', 'Ferramentas de IA, frameworks estratégicos e uma rede curada de empreendedores — tudo que você precisa para tirar sua ideia do papel.')}
        </p>

        <Button
          onClick={handleClick}
          size="lg"
          className="px-8 py-4 min-h-[52px] h-auto rounded-xl font-bold text-base bg-[#7610dc] hover:bg-[#7610dc]/90 text-white transition-colors"
        >
          {t('landing.finalCta.cta', 'Começar agora — é grátis')}
        </Button>
        <p className="text-gray-400 text-xs mt-3">
          {t('landing.finalCta.subtitle', 'Sem cartão de crédito. Acesso imediato.')}
        </p>
      </div>
    </section>
  );
};
