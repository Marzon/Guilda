import { motion } from "framer-motion";
import { fadeUp, fadeScale } from "@/lib/scroll-animations";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { LazyImage } from "@/components/LazyImage";
import problemIllustration from "@/assets/aceleracao-stress2.png";
// @ts-ignore - vite-imagetools query
import problemWebp from "@/assets/aceleracao-stress2.png?format=webp";

const APP_URL = 'https://suprema.guilda.app.br';

const BUILDER_PAINS = [
  "Tenho um produto incrível mas zero clientes",
  "Não sei precificar nem vender",
  "Marketing e vendas me travam",
  "Tento fazer tudo sozinho e não escalo",
];

const SELLER_PAINS = [
  "Tenho visão de negócio mas não codifico",
  "Já tentei no-code e não funcionou",
  "Preciso de alguém técnico que confie em mim",
  "Perdi tempo em networking que não deu em nada",
];

const Aceleracao2Problem = () => {
  const handleApply = () => {
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  };

  return (
    <section style={{ background: '#F9F5FC' }} className="py-12 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        {/* Badge */}
        <motion.div {...fadeUp(20, 0)} className="flex justify-center mb-6">
          <span
            className="text-[12px] font-semibold tracking-[2px] uppercase px-4 py-1.5 rounded-full"
            style={{
              color: '#7610DC',
              background: 'rgba(118,16,220,0.08)',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
          >
            O PROBLEMA
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          {...fadeUp(25, 0.1)}
          className="text-[32px] md:text-[48px] lg:text-[56px] leading-[1.1] text-center text-[#0A0B24]"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Por que{" "}
          <span className="text-[#F97316]">90%</span>{" "}
          das Startups Morrem
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(20, 0.2)}
          className="mt-4 text-center text-[16px] md:text-[18px] text-[#4A4A68] max-w-[500px] mx-auto"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          Não é falta de capital. É falta do sócio certo.
        </motion.p>

        {/* 3-column layout */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8">
          {/* Builder card */}
          <motion.div
            {...fadeUp(30, 0.2)}
            className="w-full md:w-1/3 bg-[#FFFBF7] rounded-2xl p-8 flex flex-col"
          >
            <span className="text-2xl mb-3">🛠️</span>
            <h3
              className="text-[20px] font-bold text-[#0A0B24] mb-1"
              style={{ fontFamily: "'Telegraf', 'Inter', sans-serif" }}
            >
              Builder Frustrado
            </h3>
            <p
              className="text-[14px] text-[#4A4A68] mb-4"
              style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
            >
              Sabe construir o produto, mas não sabe vender
            </p>
            <ul className="space-y-2.5">
              {BUILDER_PAINS.map((pain) => (
                <li
                  key={pain}
                  className="text-[15px] text-[#4A4A68] leading-[1.5] flex items-start gap-2"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  <span className="text-[#7610DC] mt-0.5 flex-shrink-0">•</span>
                  {pain}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Center illustration */}
          <motion.div
            {...fadeScale(0.9, 0.3)}
            className="w-full md:w-1/3 flex items-center justify-center order-first md:order-none py-4 md:py-0"
          >
            <LazyImage
              src={problemIllustration}
              webpSrc={problemWebp}
              alt="Fundador sobrecarregado tentando fazer tudo sozinho — papéis voando ao redor"
              className="w-[250px] md:w-[300px] lg:w-[340px] h-auto object-contain"
              containerClassName="w-[250px] md:w-[300px] lg:w-[340px] h-[250px] md:h-[300px] lg:h-[340px] flex items-center justify-center"
            />
          </motion.div>

          {/* Seller card */}
          <motion.div
            {...fadeUp(30, 0.4)}
            className="w-full md:w-1/3 bg-[#FFFBF7] rounded-2xl p-8 flex flex-col"
          >
            <span className="text-2xl mb-3">📈</span>
            <h3
              className="text-[20px] font-bold text-[#0A0B24] mb-1"
              style={{ fontFamily: "'Telegraf', 'Inter', sans-serif" }}
            >
              Seller Travado
            </h3>
            <p
              className="text-[14px] text-[#4A4A68] mb-4"
              style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
            >
              Sabe vender, mas não tem produto pra chamar de seu
            </p>
            <ul className="space-y-2.5">
              {SELLER_PAINS.map((pain) => (
                <li
                  key={pain}
                  className="text-[15px] text-[#4A4A68] leading-[1.5] flex items-start gap-2"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  <span className="text-[#7610DC] mt-0.5 flex-shrink-0">•</span>
                  {pain}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Impact phrase */}
        <motion.div
          {...fadeUp(25, 0.5)}
          className="mt-12 flex justify-center"
        >
          <div
            className="bg-[#0A0B24] rounded-xl px-8 md:px-10 py-6 max-w-[600px] w-full text-center"
            style={{ boxShadow: '0 0 40px rgba(118,16,220,0.12)' }}
          >
            <p
              className="text-white text-[18px] md:text-[22px] font-bold leading-[1.4]"
              style={{ fontFamily: "'Telegraf', 'Inter', sans-serif" }}
            >
              Sozinhos, vocês travam. Juntos, vocês lançam.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(20, 0.6)} className="mt-8 flex justify-center">
          <button
            onClick={handleApply}
            className="bg-[#7610DC] hover:bg-[#4308B0] text-white font-bold text-base md:text-lg px-7 py-3.5 rounded-xl transition-colors duration-200"
            style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
          >
            Entrar na Aceleração →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Aceleracao2Problem;
