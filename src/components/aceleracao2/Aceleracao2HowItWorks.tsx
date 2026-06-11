import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";
import { LazyImage } from "@/components/LazyImage";
import matchImg from "@/assets/aceleracao-match.png";
import buildImg from "@/assets/aceleracao-build.png";
import launchImg from "@/assets/aceleracao-launch.png";
// @ts-ignore - vite-imagetools query
import matchWebp from "@/assets/aceleracao-match.png?format=webp";
// @ts-ignore - vite-imagetools query
import buildWebp from "@/assets/aceleracao-build.png?format=webp";
// @ts-ignore - vite-imagetools query
import launchWebp from "@/assets/aceleracao-launch.png?format=webp";

const PHASES = [
  {
    img: matchImg,
    webp: matchWebp,
    alt: "Duas pessoas apertando mãos — encontro entre Builder e Seller",
    badge: "DIAS 1-3",
    title: "Match",
    desc: "Encontre sua dupla ideal. Builder + Seller pareados por compatibilidade de portfólio e disponibilidade.",
  },
  {
    img: buildImg,
    webp: buildWebp,
    alt: "Dupla trabalhando em planos e wireframes juntos",
    badge: "DIAS 4-10",
    title: "Build",
    desc: "Construam o MVP juntos. O Builder codifica, o Seller valida o mercado. Mentores de IA guiam o processo.",
  },
  {
    img: launchImg,
    webp: launchWebp,
    alt: "Dupla com laptop e produto pronto para lançar",
    badge: "DIAS 11-15",
    title: "Launch",
    desc: "Vão ao mercado. Vendam. Validem com receita real. Sem receita, sem startup — simples assim.",
    imgScale: 1.18,
  },
];

const Aceleracao2HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-12 md:py-[120px]" style={{ background: '#F9F5FC' }}>
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
            A SOLUÇÃO
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          {...fadeUp(25, 0.1)}
          className="text-[32px] md:text-[48px] lg:text-[56px] leading-[1.1] text-center text-[#0A0B24]"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Como Funciona a{" "}
          <span className="text-[#7610DC]">Aceleração</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(20, 0.2)}
          className="mt-4 text-center text-[16px] md:text-[18px] text-[#4A4A68] max-w-[560px] mx-auto"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          15 dias de aceleração brutal. Vamos do zero à startup com receita real.
        </motion.p>

        {/* 3 Phase blocks */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative items-start">
          {/* Connection line — desktop only */}
          <div
            className="hidden md:block absolute top-[120px] left-[16%] right-[16%] h-[2px] z-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, rgba(118,16,220,0.2) 0, rgba(118,16,220,0.2) 8px, transparent 8px, transparent 16px)',
            }}
          />

          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.title}
              {...fadeUp(30, 0.2 + i * 0.15)}
              className="flex flex-col items-center text-center relative z-10"
            >
              {/* Illustration container */}
              <div className="h-[200px] md:h-[240px] w-full flex items-center justify-center mb-6">
                <LazyImage
                  src={phase.img}
                  webpSrc={phase.webp}
                  alt={phase.alt}
                  className="max-h-[200px] md:max-h-[240px] w-auto object-contain"
                  containerClassName="h-[200px] md:h-[240px] flex items-center justify-center"
                />
              </div>

              {/* Day badge */}
              <span
                className="inline-block text-[11px] font-bold tracking-wide text-white px-3 py-1 rounded-full mb-4"
                style={{
                  background: '#F97316',
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                }}
              >
                {phase.badge}
              </span>

              {/* Title */}
              <h3
                className="text-[28px] font-bold text-[#0A0B24] mb-3"
                style={{ fontFamily: "'Telegraf', 'Inter', sans-serif" }}
              >
                {phase.title}
              </h3>

              {/* Description */}
              <p
                className="text-[15px] text-[#4A4A68] leading-[1.6] max-w-[300px]"
                style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
              >
                {phase.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Aceleracao2HowItWorks;
