import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Code2, Rocket, ChevronDown } from "lucide-react";
import builderChar from "@/assets/lp2-builder-character.png";
import sellerChar from "@/assets/lp2-seller-character.png";
import { useIsMobile } from "@/hooks/use-mobile";
import buildupLogo from "@/assets/lp2-buildup-logo.webp";
import matchIllustration from "@/assets/lp2-match-buildup.webp";

const PHASES = [
  {
    icon: Users,
    label: "Fase 1 — Match",
    color: "#7610DC",
    badge: "Dias 1–3",
    badgeBg: "#EDE0FF",
    badgeText: "#7610DC",
    description:
      "Em até 3 dias você é pareado com um co-fundador complementar ao seu perfil. Builder encontra Seller. Seller encontra Builder.",
  },
  {
    icon: Code2,
    label: "Fase 2 — Build",
    color: "#4308B0",
    badge: "Dias 4–10",
    badgeBg: "#D6C4F0",
    badgeText: "#4308B0",
    description:
      "Dupla formada, mãos na massa. 7 dias para sair do zero a um MVP funcional com mentores de IA integrados ao processo.",
  },
  {
    icon: Rocket,
    label: "Fase 3 — Launch",
    color: "#F97316",
    badge: "Dias 11–15",
    badgeBg: "#FFF1E6",
    badgeText: "#F97316",
    description:
      "Ir ao mercado de verdade. Validar com receita real. O protocolo DO OR DIE começa aqui — execução ou estagnação.",
  },
];

const LP2Phases = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();

  // activeIndex: 0,1,2 = card phases; 3 = final state
  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = sectionRef.current.offsetHeight;
    const viewportH = window.innerHeight;
    const scrolled = Math.max(0, -rect.top) / (sectionHeight - viewportH);
    const clamped = Math.min(Math.max(scrolled, 0), 1);

    if (clamped < 0.25) setActiveIndex(0);
    else if (clamped < 0.50) setActiveIndex(1);
    else if (clamped < 0.75) setActiveIndex(2);
    else setActiveIndex(3);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const isFinal = activeIndex === 3;

  // Shared card renderer
  const renderStackedCards = (cardPadding: number, cardMinHeight: number, fontSize: { title: number; desc: number }) => (
    PHASES.map(({ icon: Icon, label, color, badge, badgeBg, badgeText, description }, i) => {
      const isGone = i < activeIndex || isFinal;
      const isCurrent = i === activeIndex && !isFinal;
      const isBehind = i > activeIndex && !isFinal;
      const stackOffset = i - activeIndex;

      return (
        <div
          key={label}
          className="absolute inset-x-0 w-full bg-white flex flex-col gap-4"
          style={{
            borderRadius: 20,
            padding: cardPadding,
            minHeight: cardMinHeight,
            boxShadow: isCurrent
              ? "0 8px 30px -8px rgba(118,16,220,0.18)"
              : "0 2px 12px -4px rgba(0,0,0,0.08)",
            transform: isGone
              ? "translateY(-110vh) scale(0.95)"
              : isCurrent
              ? "translateY(0) scale(1)"
              : `translateY(${stackOffset * 16}px) scale(${1 - stackOffset * 0.04})`,
            opacity: isGone ? 0 : isBehind ? 0.6 : 1,
            zIndex: 10 - i,
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, box-shadow 0.4s ease",
            pointerEvents: isCurrent ? "auto" : "none",
          }}
        >
          <div className="w-full h-2 rounded-full" style={{ background: color }} />
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 52, height: 52, background: `${color}15` }}
            >
              <Icon size={28} style={{ color }} />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-telegraf" style={{ fontSize: fontSize.title, fontWeight: 700, color: "#0A0B24" }}>{label}</span>
              <span
                className="font-semibold rounded-full w-fit"
                style={{ fontSize: 13, padding: "4px 12px", background: badgeBg, color: badgeText }}
              >
                {badge}
              </span>
            </div>
          </div>
          <p className="font-sans" style={{ fontSize: fontSize.desc, lineHeight: 1.6, color: "#3D3D5C" }}>
            {description}
          </p>
        </div>
      );
    })
  );

  // Final state overlay — replaces cards area when isFinal
  const renderFinalState = (illustrationHeight: number, headlineFontSize: number) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        opacity: isFinal ? 1 : 0,
        transition: "opacity 0.5s ease 0.1s",
        pointerEvents: isFinal ? "auto" : "none",
        zIndex: 20,
        background: "#EDE0FF",
        padding: "48px 24px",
      }}
    >
      <img
        src={matchIllustration}
        alt="Builder e Seller dando as mãos"
        loading="lazy"
        width={320}
        height={320}
        style={{
          height: illustrationHeight,
          width: "auto",
          objectFit: "contain",
          marginBottom: 16,
          opacity: isFinal ? 1 : 0,
          transform: isFinal ? "translateY(0)" : "translateY(60px)",
          transition: "opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s",
        }}
      />
      <h3
        className="font-serif font-thin italic text-center"
        style={{
          fontSize: headlineFontSize,
          color: "#7610DC",
          marginBottom: 8,
          opacity: isFinal ? 1 : 0,
          transform: isFinal ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s",
        }}
      >
        Match feito.
      </h3>
      <p
        className="font-sans text-center"
        style={{
          fontSize: 18,
          color: "#3D3D5C",
          marginBottom: 24,
          opacity: isFinal ? 1 : 0,
          transform: isFinal ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease 0.7s, transform 0.5s ease 0.7s",
        }}
      >
        Agora é só construir.
      </p>
      <a
        href="https://suprema.guilda.app.br/aceleracao"
        className="rounded-full font-semibold text-white text-center"
        style={{
          background: "#F97316",
          padding: "14px 32px",
          fontSize: 16,
          opacity: isFinal ? 1 : 0,
          transform: isFinal ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease 0.8s, transform 0.5s ease 0.8s",
        }}
      >
        Garantir minha vaga na Aceleração
      </a>
      <span
        className="font-sans text-center"
        style={{
          fontSize: 13,
          color: "#8A8AA8",
          marginTop: 8,
          opacity: isFinal ? 1 : 0,
          transition: "opacity 0.5s ease 0.9s",
        }}
      >
        Vagas limitadas por cohort.
      </span>
    </div>
  );

  // Mobile: sticky scroll
  if (isMobile) {
    return (
      <div ref={sectionRef} id="aceleracao" className="relative" style={{ height: "500vh" }}>
        <div
          className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden"
          style={{ padding: 24 }}
        >
          <div
            className="flex flex-col items-center w-full h-full relative"
            style={{
              background: "#EDE0FF",
              borderRadius: "var(--lp2-radius-section)",
              padding: "32px 20px",
              justifyContent: "center",
            }}
          >
            {/* Logo — hide on final */}
            <img
              src={buildupLogo}
              alt="Guilda buildUP"
              loading="lazy"
              width={120}
              height={120}
              style={{
                height: 120,
                width: "auto",
                objectFit: "contain",
                marginBottom: 24,
                opacity: isFinal ? 0 : 1,
                transition: "opacity 0.4s ease",
               }}
            />
            {/* Title — hide on final */}
            <h2
              className="font-serif font-thin text-center"
              style={{
                fontSize: 32,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                marginBottom: 32,
                opacity: isFinal ? 0 : 1,
                transform: isFinal ? "translateY(-20px)" : "translateY(0)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              <span style={{ color: "#7610DC" }}>Aceleração da Guilda.</span>
            </h2>

            {/* Card area with characters */}
            <div
              className="relative w-full flex items-center justify-center"
              style={{
                maxWidth: 420,
                opacity: isFinal ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Builder — left */}
              <img
                src={builderChar}
                alt="Builder"
                loading="lazy"
                width={72}
                height={120}
                className="absolute"
                style={{
                  left: -8,
                  bottom: 60,
                  width: 72,
                  objectFit: "contain",
                  opacity: isFinal ? 0 : 0.85,
                  transform: isFinal ? "translateX(-120%)" : "translateX(0)",
                  transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
              />

              {/* Stacked cards */}
              <div className="relative w-full" style={{ minHeight: 260 }}>
                {renderStackedCards(28, 260, { title: 20, desc: 15 })}
              </div>

              {/* Seller — right */}
              <img
                src={sellerChar}
                alt="Seller"
                loading="lazy"
                width={72}
                height={120}
                className="absolute"
                style={{
                  right: -8,
                  bottom: 60,
                  width: 72,
                  objectFit: "contain",
                  opacity: isFinal ? 0 : 0.85,
                  transform: isFinal ? "translateX(120%)" : "translateX(0)",
                  transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
              />
            </div>

            {/* Progress bars */}
            <div
              className="flex items-center justify-center"
              style={{
                gap: 8,
                marginTop: 24,
                opacity: isFinal ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {[...PHASES, null].map((_, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    height: 3,
                    width: i === activeIndex ? 56 : 40,
                    background: i <= activeIndex ? "#7610DC" : "#D4C8F0",
                    transition: "all 0.4s ease",
                  }}
                />
              ))}
            </div>

            {/* Scroll arrow */}
            {activeIndex < 3 && (
              <motion.div
                className="flex justify-center mt-4"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={24} style={{ color: "#7610DC", opacity: 0.5 }} />
              </motion.div>
            )}

            {/* Final state overlay */}
            {renderFinalState(220, 36)}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: sticky scroll with stacked cards
  return (
    <div ref={sectionRef} id="aceleracao" className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen flex items-start justify-center overflow-hidden">
        <div className="w-full">
          <div
            className="flex flex-col items-center relative"
            style={{
              background: "#EDE0FF",
              borderRadius: "var(--lp2-radius-section)",
              padding: "72px 48px",
            }}
          >
            {/* Logo — hide on final */}
            <motion.img
              src={buildupLogo}
              alt="Guilda buildUP"
              loading="lazy"
              width={160}
              height={160}
              style={{
                height: 160,
                width: "auto",
                objectFit: "contain",
                marginBottom: 16,
                opacity: isFinal ? 0 : 1,
                transform: isFinal ? "translateY(-20px)" : "translateY(0)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            />
            {/* Title — hide on final */}
            <motion.h2
              className="font-serif font-thin text-center"
              style={{
                fontSize: 64,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                marginBottom: 8,
                opacity: isFinal ? 0 : 1,
                transform: isFinal ? "translateY(-20px)" : "translateY(0)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span style={{ color: "#7610DC" }}>Aceleração da Guilda.</span>
            </motion.h2>

            <motion.p
              className="font-sans text-center"
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: "#3D3D5C",
                maxWidth: 560,
                marginTop: 20,
                marginBottom: 48,
                opacity: isFinal ? 0 : 1,
                transition: "opacity 0.4s ease",
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Um programa intensivo e gratuito para formar duplas reais de co-fundadores e lançar um MVP validado.
            </motion.p>

            {/* Grid: Character | Card | Character */}
            <div
              className="w-full mx-auto"
              style={{
                maxWidth: 1100,
                display: "grid",
                gridTemplateColumns: "220px 1fr 220px",
                gap: 40,
                alignItems: "center",
                overflow: "visible",
                opacity: isFinal ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Builder character — left */}
              <motion.img
                src={builderChar}
                alt="Builder roxo"
                loading="lazy"
                width={220}
                height={320}
                style={{
                  height: 320,
                  width: "auto",
                  objectFit: "contain",
                  alignSelf: "center",
                  transform: isFinal ? "translateX(-120%)" : "translateX(0)",
                  opacity: isFinal ? 0 : 1,
                  transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              />

              {/* Stacked cards */}
              <div className="relative w-full" style={{ maxWidth: 640, minHeight: 280, margin: "0 auto" }}>
                {renderStackedCards(40, 280, { title: 24, desc: 17 })}
              </div>

              {/* Seller character — right */}
              <motion.img
                src={sellerChar}
                alt="Seller laranja"
                loading="lazy"
                width={220}
                height={320}
                style={{
                  height: 320,
                  width: "auto",
                  objectFit: "contain",
                  alignSelf: "center",
                  transform: isFinal ? "translateX(120%)" : "translateX(0)",
                  opacity: isFinal ? 0 : 1,
                  transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              />
            </div>

            {/* Scroll arrow hint */}
            {activeIndex < 3 && (
              <motion.div
                className="flex justify-center mt-6"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={28} style={{ color: "#7610DC", opacity: 0.5 }} />
              </motion.div>
            )}

            {/* Final state overlay */}
            {renderFinalState(320, 48)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LP2Phases;
