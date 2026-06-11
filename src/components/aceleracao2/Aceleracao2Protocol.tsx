import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";
import { Scissors, Rocket, Swords, Scale, Check } from "lucide-react";
import buildupLogo from "@/assets/aceleracao-buildup-logo.png";

const PHASES = [
  {
    days: "D1–3",
    name: "O Corte",
    subtitle: "Mate suas ideias ruins",
    color: "#ea7100",
    icon: Scissors,
    description:
      "Descubra rápido se sua ideia tem potencial ou é ilusão.",
    checks: [
      "Análise de mercado em 2h",
      "10 conversas com clientes",
      "Decisão: pivotar ou matar",
    ],
    deliverable: "Nota de Validação",
    barWidth: "20%",
  },
  {
    days: "D4–7",
    name: "A Construção",
    subtitle: "O MVP feio que funciona",
    color: "#a728eb",
    icon: Rocket,
    description:
      "Construa a versão mais simples que resolve o problema.",
    checks: [
      "Definição da feature central",
      "Construção em modo turbo",
      "Zero perfeccionismo, só função",
    ],
    deliverable: "MVP Funcional",
    barWidth: "27%",
  },
  {
    days: "D8–13",
    name: "A Ofensiva",
    subtitle: "Vá vender de verdade",
    color: "#7610dc",
    icon: Swords,
    description:
      "Lance, venda e colete feedback real em tempo recorde.",
    checks: [
      "Lançamento para early users",
      "Primeiras vendas de verdade",
      "Coleta de feedback brutal",
    ],
    deliverable: "Primeira Receita",
    barWidth: "40%",
  },
  {
    days: "D15",
    name: "O Veredito",
    subtitle: "A hora da verdade",
    color: "#4308b0",
    icon: Scale,
    description:
      "Apresente resultados e receba o veredito dos mentores.",
    checks: [
      "Pitch com métricas reais",
      "Banca de avaliação final",
      "Feedback direto e honesto",
    ],
    deliverable: "Decisão Final",
    barWidth: "13%",
  },
];

const Aceleracao2Protocol = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.scrollWidth / PHASES.length;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, PHASES.length - 1));
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
    const cardWidth = el.scrollWidth / PHASES.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  };

  return (
    <section style={{ background: "#F9F5FC" }} className="py-12 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        {/* Badge */}
        <motion.div {...fadeUp(20, 0)} className="flex justify-center mb-6">
          <span
            className="text-[12px] font-semibold tracking-[2px] uppercase px-5 py-2 rounded-full"
            style={{
              color: "#F97316",
              background: "rgba(249, 115, 22, 0.1)",
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
          >
            O PROTOCOLO
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div {...fadeUp(25, 0.1)} className="flex justify-center mt-6 mb-2">
          <img
            src={buildupLogo}
            alt="Guilda BuildUP"
            className="h-[80px] md:h-[120px] w-auto"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(20, 0.2)}
          className="mt-4 text-center text-[16px] md:text-[18px] leading-[1.6]"
          style={{ color: "#4A4A68", fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          4 fases intensivas para ir de ideia a negócio validado.
        </motion.p>

        {/* Progress bar — desktop */}
        <motion.div
          {...fadeUp(15, 0.3)}
          className="hidden md:flex mt-14 mb-10 rounded-full overflow-hidden h-1"
        >
          {PHASES.map((p) => (
            <div key={p.name} className="h-full" style={{ width: p.barWidth, background: p.color }} />
          ))}
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-6">
          {PHASES.map((phase, i) => (
            <PhaseCard key={phase.name} phase={phase} index={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div
          ref={carouselRef}
          className="md:hidden mt-10 pt-10 flex gap-4 -mx-5 px-5 pb-4"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {PHASES.map((phase, i) => (
            <div key={phase.name} className="min-w-[80vw] snap-center" style={{ overflow: "visible" }}>
              <PhaseCard phase={phase} index={i} />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="md:hidden flex justify-center gap-2 mt-4">
          {PHASES.map((phase, i) => (
            <button
              key={phase.name}
              onClick={() => scrollToIndex(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width: activeIndex === i ? 24 : 8,
                height: 8,
                background: activeIndex === i ? phase.color : "#D1D1D6",
              }}
              aria-label={`Ir para ${phase.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const PhaseCard = ({ phase, index }: { phase: typeof PHASES[number]; index: number }) => {
  const Icon = phase.icon;
  return (
    <motion.div
      {...fadeUp(30, 0.3 + index * 0.1)}
      className="relative rounded-2xl pt-10 pb-7 px-5 md:px-7 flex flex-col h-full"
      style={{ background: '#F9F5FC', border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
    >
      {/* Icon circle */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center"
        style={{ border: `3px solid ${phase.color}` }}
      >
        <Icon size={20} style={{ color: phase.color }} />
      </div>

      {/* Day badge */}
      <span
        className="self-start text-[12px] font-bold text-white px-3 py-1 rounded mb-4"
        style={{ background: phase.color, fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        {phase.days}
      </span>

      {/* Name */}
      <h3
        className="text-[22px] md:text-[24px] font-bold mb-1"
        style={{ color: phase.color, fontFamily: "'Telegraf', 'Inter', sans-serif" }}
      >
        {phase.name}
      </h3>

      {/* Subtitle */}
      <p
        className="text-[13px] md:text-[14px] font-medium mb-3"
        style={{ color: "#4A4A68", fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        {phase.subtitle}
      </p>

      {/* Description */}
      <p
        className="text-[13px] md:text-[14px] leading-[1.6] mb-5"
        style={{ color: "#4A4A68", fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        {phase.description}
      </p>

      {/* Checklist */}
      <ul className="space-y-3 mb-5 flex-1">
        {phase.checks.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: phase.color }} strokeWidth={3} />
            <span
              className="text-[13px] md:text-[14px] leading-[1.5]"
              style={{ color: "#0A0B24", fontFamily: "'Montserrat', 'Inter', sans-serif" }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>

      {/* Deliverable box */}
      <div
        className="rounded-[10px] px-4 py-3.5"
        style={{
          background: `${phase.color}12`,
          borderLeft: `3px solid ${phase.color}`,
        }}
      >
        <p
          className="text-[12px] mb-1"
          style={{ color: "#4A4A68", fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          Entregável:
        </p>
        <p
          className="text-[14px] md:text-[15px] font-semibold"
          style={{ color: phase.color, fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          {phase.deliverable}
        </p>
      </div>
    </motion.div>
  );
};

export default Aceleracao2Protocol;
