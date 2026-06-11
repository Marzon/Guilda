import { Code, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { fadeIn, fadeUp, fadeX, fadeScale } from "@/lib/scroll-animations";

const APP_URL = 'https://suprema.guilda.app.br';

const DoOrDieProblem = () => {
  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/aceleracao/inscrever');
  };

  return (
    <section className="bg-[#FFFBF7] pt-14 sm:pt-20 pb-12 sm:pb-20">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* Tag */}
        <motion.p
          className="text-center text-[13px] uppercase tracking-[0.05em] font-semibold text-[#7610DC] mb-4"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          {...fadeIn(0)}
        >
          O PROBLEMA
        </motion.p>

        {/* Headline */}
        <motion.h2
          className="text-center text-[28px] sm:text-[40px] font-bold leading-[1.15] text-[#0A0B24]"
          style={{ fontFamily: 'Telegraf, Inter, sans-serif' }}
          {...fadeUp(25, 0.1)}
        >
          Por que <span className="text-[#F97316]">90%</span> das startups morrem antes de lançar?
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          className="text-center text-base sm:text-lg text-[#6B7280] mt-3 mb-12"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          {...fadeIn(0.2)}
        >
          Não é falta de capital. É falta do sócio certo.
        </motion.p>

        {/* Cards */}
        <div className="flex flex-row gap-2.5 sm:gap-6">
          {/* Builder Card */}
          <motion.div
            className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 sm:p-8 flex-1 min-w-0"
            {...fadeX(-40, 0.15)}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-[#7610DC]/10 flex items-center justify-center mb-3 sm:mb-5">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-[#7610DC]" />
            </div>
            <h3 className="text-[15px] sm:text-xl font-bold text-[#0A0B24] mb-2 sm:mb-3" style={{ fontFamily: 'Telegraf, Inter, sans-serif' }}>
              Builder Frustrado
            </h3>
            <p className="hidden sm:block text-[#6B7280] text-base mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Você sabe construir. Mas quem vai vender? Sem um sócio comercial, seu produto perfeito morre sem clientes.
            </p>
            {/* Mobile bullets */}
            <ul className="sm:hidden space-y-1.5 text-[#6B7280] text-[12px] leading-[1.4]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <li className="flex items-start gap-1.5"><span className="mt-1.5 w-[5px] h-[5px] rounded-full bg-[#7610DC] flex-shrink-0" />Não sabe vender</li>
              <li className="flex items-start gap-1.5"><span className="mt-1.5 w-[5px] h-[5px] rounded-full bg-[#7610DC] flex-shrink-0" />Fez tudo sozinho</li>
              <li className="flex items-start gap-1.5"><span className="mt-1.5 w-[5px] h-[5px] rounded-full bg-[#7610DC] flex-shrink-0" />Quer sócio comercial</li>
            </ul>
            {/* Desktop bullets */}
            <ul className="hidden sm:block space-y-2 text-[#6B7280] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7610DC] flex-shrink-0" />Não sei nem por onde começar a vender</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7610DC] flex-shrink-0" />Já tentei fazer tudo sozinho e burnei</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7610DC] flex-shrink-0" />Marketing e vendas não são meu jogo</li>
            </ul>
          </motion.div>

          {/* Seller Card */}
          <motion.div
            className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 sm:p-8 flex-1 min-w-0"
            {...fadeX(40, 0.25)}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-[#F97316]/10 flex items-center justify-center mb-3 sm:mb-5">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#F97316]" />
            </div>
            <h3 className="text-[15px] sm:text-xl font-bold text-[#0A0B24] mb-2 sm:mb-3" style={{ fontFamily: 'Telegraf, Inter, sans-serif' }}>
              Seller Travado
            </h3>
            <p className="hidden sm:block text-[#6B7280] text-base mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Você sabe vender. Mas quem vai construir? Sem um sócio técnico, sua ideia genial fica presa no PowerPoint.
            </p>
            {/* Mobile bullets */}
            <ul className="sm:hidden space-y-1.5 text-[#6B7280] text-[12px] leading-[1.4]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <li className="flex items-start gap-1.5"><span className="mt-1.5 w-[5px] h-[5px] rounded-full bg-[#F97316] flex-shrink-0" />Não tira do papel</li>
              <li className="flex items-start gap-1.5"><span className="mt-1.5 w-[5px] h-[5px] rounded-full bg-[#F97316] flex-shrink-0" />Freelancer não resolve</li>
              <li className="flex items-start gap-1.5"><span className="mt-1.5 w-[5px] h-[5px] rounded-full bg-[#F97316] flex-shrink-0" />Quer sócio técnico</li>
            </ul>
            {/* Desktop bullets */}
            <ul className="hidden sm:block space-y-2 text-[#6B7280] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F97316] flex-shrink-0" />Não consigo tirar do papel</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F97316] flex-shrink-0" />Tentei contratar dev freelancer e foi um desastre</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F97316] flex-shrink-0" />Preciso de alguém que construa comigo, não para mim</li>
            </ul>
          </motion.div>
        </div>

        {/* Transition phrase */}
        <motion.div
          className="mt-12 mx-auto max-w-2xl bg-[#7610DC]/5 border border-[#7610DC]/20 rounded-xl py-6 px-8 text-center"
          {...fadeScale(0.95, 0.35)}
        >
          <p className="text-xl sm:text-2xl font-bold text-[#0A0B24]" style={{ fontFamily: 'Telegraf, Inter, sans-serif' }}>
            Sozinhos, vocês travam. Juntos, vocês lançam.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-6"
          {...fadeUp(15, 0.45)}
        >
          <button
            onClick={handleApply}
            className="inline-block bg-[#F97316] hover:bg-[#E86A10] text-white font-bold text-base px-8 py-4 rounded-full transition-colors duration-200 shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Entrar na Aceleração →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DoOrDieProblem;
