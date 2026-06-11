import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";

const METRICS = [
  { number: "433+", label: "Founders cadastrados" },
  { number: "15", label: "Dias para lançar" },
  { number: "R$ 0", label: "Para começar" },
];

const TESTIMONIALS = [
  {
    quote: "Eu achava que precisava de 3 meses para lançar. Lancei em 4 dias e vendi no quinto. O protocolo mudou minha forma de pensar produto.",
    name: "@lucas_builder",
    role: "Participante Aceleração",
    avatarBg: "rgba(118, 16, 220, 0.15)",
    initial: "L",
  },
  {
    quote: "Encontrei meu co-fundador técnico no programa. Em 15 dias fizemos mais do que em 6 meses sozinho tentando aprender a programar.",
    name: "@marina_seller",
    role: "Participante Aceleração",
    avatarBg: "rgba(249, 115, 22, 0.15)",
    initial: "M",
  },
  {
    quote: "O match foi perfeito: eu com a visão de vendas, ele com a expertise técnica. Em 3 meses, já tínhamos nosso primeiro cliente pagante.",
    name: "@pedro_ceo",
    role: "Participante Aceleração",
    avatarBg: "rgba(180, 83, 9, 0.15)",
    initial: "P",
  },
];

const TESTIMONIAL_COLORS = ["#7610DC", "#F97316", "#B45309"];

const Aceleracao2SocialProof = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / TESTIMONIALS.length;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, TESTIMONIALS.length - 1));
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / TESTIMONIALS.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  };

  const handleApply = () => {
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  };

  return (
    <section style={{ background: '#F9F5FC' }} className="py-12 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">

        {/* PART 1 — Metrics */}
        <motion.div {...fadeUp(20, 0)} className="flex justify-center mb-6">
          <span
            className="text-[12px] font-semibold tracking-[2px] uppercase px-5 py-2 rounded-full"
            style={{
              color: '#7610DC',
              background: 'rgba(118, 16, 220, 0.08)',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
          >
            RESULTADOS REAIS
          </span>
        </motion.div>

        <motion.h2
          {...fadeUp(25, 0.1)}
          className="text-[32px] md:text-[48px] leading-[1.15] text-center text-[#0A0B24]"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Números que falam<br />
          <span className="text-[#F97316]">por si só.</span>
        </motion.h2>

        {/* Metrics grid */}
        <motion.div
          {...fadeUp(20, 0.25)}
          className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-[800px] mx-auto"
        >
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <p
                className="text-[40px] md:text-[56px] font-bold"
                style={{ color: '#7610DC', fontFamily: "'Telegraf', 'Inter', sans-serif" }}
              >
                {m.number}
              </p>
              <p
                className="text-[13px] md:text-[15px] mt-2"
                style={{ color: '#4A4A68', fontFamily: "'Montserrat', 'Inter', sans-serif" }}
              >
                {m.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Separator */}
        <div className="mt-12 md:mt-16 mx-auto max-w-[800px] h-px bg-[#E5E5E5]" />

        {/* PART 2 — Testimonials */}
        <motion.h3
          {...fadeUp(20, 0.3)}
          className="mt-12 md:mt-16 text-[24px] md:text-[32px] text-center text-[#0A0B24]"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Quem já passou pela Aceleração
        </motion.h3>

        {/* Desktop: 3-col grid / Mobile: horizontal scroll */}
        <motion.div
          {...fadeUp(20, 0.4)}
          className="mt-10 md:mt-12 hidden md:grid md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </motion.div>

        {/* Mobile carousel */}
        <div
          ref={carouselRef}
          className="mt-10 md:hidden flex gap-4 pb-4 -mx-5 px-5"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="min-w-[80vw] snap-center">
              <TestimonialCard {...t} />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="md:hidden flex justify-center gap-2 mt-4">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width: activeIndex === i ? 24 : 8,
                height: 8,
                background: activeIndex === i ? TESTIMONIAL_COLORS[i] : "#D1D1D6",
              }}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div {...fadeUp(20, 0.5)} className="mt-12 md:mt-16 flex flex-col items-center text-center">
          <p
            className="text-[16px] md:text-[18px]"
            style={{ color: '#4A4A68', fontFamily: "'Montserrat', 'Inter', sans-serif", fontWeight: 500 }}
          >
            A próxima história de sucesso pode ser a sua.
          </p>
          <button
            onClick={handleApply}
            className="mt-5 text-white font-semibold text-[16px] px-8 md:px-10 py-4 md:py-[18px] rounded-xl transition-all duration-200 hover:scale-[1.02] w-full max-w-[400px] md:w-auto"
            style={{ background: '#7610DC', fontFamily: "'Montserrat', 'Inter', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4308B0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#7610DC')}
          >
            Aplicar para a Aceleração →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialCard = ({
  quote, name, role, avatarBg, initial,
}: {
  quote: string; name: string; role: string; avatarBg: string; initial: string;
}) => (
  <div
    className="rounded-2xl p-6 md:p-8 flex flex-col h-full"
    style={{ background: '#F9F5FC', border: '1px solid #F0F0F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    {/* Quote mark */}
    <span
      className="text-[48px] leading-none font-bold opacity-60 mb-4"
      style={{ color: '#A728EB', fontFamily: "Georgia, serif" }}
    >
      "
    </span>

    {/* Quote text */}
    <p
      className="text-[14px] md:text-[15px] leading-[1.7] text-[#0A0B24] flex-1"
      style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
    >
      "{quote}"
    </p>

    {/* Author */}
    <div className="mt-6 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-bold flex-shrink-0"
        style={{ background: avatarBg, border: '2px solid #7610DC', color: '#7610DC' }}
      >
        {initial}
      </div>
      <div className="min-w-0">
        <p
          className="text-[15px] font-semibold text-[#0A0B24] truncate"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          {name}
        </p>
        <p
          className="text-[13px] text-[#4A4A68]"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          {role}
        </p>
      </div>
    </div>
  </div>
);

export default Aceleracao2SocialProof;
