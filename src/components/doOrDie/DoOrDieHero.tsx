import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { onLoadFadeScale, onLoadFadeUp, onLoadFadeUpScale, onLoadFadeIn } from "@/lib/scroll-animations";

const APP_URL = 'https://suprema.guilda.app.br';

// Target: 25/02/2026 23:59 São Paulo time (UTC-3)
const TARGET_DATE = new Date('2026-02-26T02:59:00Z');

const DoOrDieHero = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = TARGET_DATE.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/aceleracao/inscrever');
  };

  return (
    <section className="bg-[#FFFBF7] pt-[100px] sm:pt-[120px] pb-[64px] sm:pb-[96px]">
      <div className="max-w-[800px] mx-auto px-4 text-center">
        {/* Countdown Badge */}
        <motion.span
          className="relative z-10 inline-flex bg-[#7610DC]/10 text-[#7610DC] text-[13px] uppercase tracking-[0.05em] font-semibold px-4 py-1.5 rounded-full mb-7 sm:mb-9"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          {...onLoadFadeScale(0.92, 0.1, 0.5)}
        >
          ⚡ Inscrições encerram em {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}min
        </motion.span>

        {/* Headline */}
        <motion.h1
          className="text-[36px] sm:text-[56px] font-bold leading-[1.1] text-[#0A0B24]"
          style={{ fontFamily: 'Telegraf, Inter, sans-serif' }}
          {...onLoadFadeUp(40, 0.2)}
        >
          De Ideia a Startup
          <br />
          com Receita.
          <br />
          Em <span className="text-[#7610DC]">15 Dias</span>.
        </motion.h1>

        {/* Subheadline - Mobile */}
        <motion.p
          className="sm:hidden mt-6 text-base text-[#6B7280] max-w-[640px] mx-auto"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          {...onLoadFadeUp(25, 0.4)}
        >
          A aceleração que conecta você ao co-fundador certo e leva do zero ao lançamento.
        </motion.p>
        {/* Subheadline - Desktop */}
        <motion.p
          className="hidden sm:block mt-7 text-lg text-[#6B7280] max-w-[640px] mx-auto"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          {...onLoadFadeUp(25, 0.4)}
        >
          A aceleração que conecta você ao co-fundador certo e leva do zero ao lançamento. Match por compatibilidade real, MVP com mentoria de IA e validação com o mercado.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-9 sm:mt-12"
          {...onLoadFadeUpScale(20, 0.97, 0.55)}
        >
          <button
            onClick={handleApply}
            className="inline-block bg-[#F97316] hover:bg-[#E86A10] text-white font-bold text-base px-8 py-4 rounded-full transition-colors duration-200 shadow-[0_4px_14px_rgba(249,115,22,0.35)] max-w-[340px]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Entrar na Aceleração →
          </button>
        </motion.div>

        {/* Microcopy */}
        <motion.p
          className="mt-5 sm:mt-6 text-[14px] font-medium text-[#6B7280]"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          {...onLoadFadeIn(0.7)}
        >
          ⏱ Vagas limitadas por turma. Cadastre-se agora.
        </motion.p>

      </div>
    </section>
  );
};

export default DoOrDieHero;
