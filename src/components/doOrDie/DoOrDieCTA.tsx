import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { fadeUpScale, fadeIn, fadeUp } from "@/lib/scroll-animations";

const APP_URL = 'https://suprema.guilda.app.br';

const DoOrDieCTA = () => {
  const handleClick = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/aceleracao/inscrever');
  };

  return (
    <section className="py-12 px-6 md:py-20 md:px-4 bg-[#4308B0]">
      <div className="max-w-2xl mx-auto text-center">
        {/* Headline */}
        <motion.h2
          className="text-[32px] font-bold text-white mb-4"
          {...fadeUpScale(20, 0.97, 0.1)}
        >
          Pronto para Parar de Brincar?
        </motion.h2>
        
        {/* Subtexto */}
        <motion.p
          className="text-lg text-white/90 mb-4"
          {...fadeIn(0.25)}
        >
          15 dias para sair da ideia para o mercado. Vagas são limitadas.
        </motion.p>

        {/* Pricing */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8"
          {...fadeIn(0.3)}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">Incluso no plano Founder — R$ 899,90/semestre</span>
        </motion.div>
        
        {/* CTA Button */}
        <motion.div {...fadeUpScale(15, 0.95, 0.4)}>
          <Button
            onClick={handleClick}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-black text-lg px-8 py-4 h-auto rounded-xl transition-all duration-150 uppercase tracking-wide"
          >
            Inscrever-se Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
        
        {/* Info line */}
        <motion.p
          className="text-sm text-white/70 mt-6"
          {...fadeIn(0.5)}
        >
          Sem taxa extra • Sem equity • Sem success fee
        </motion.p>
      </div>
    </section>
  );
};

export default DoOrDieCTA;
