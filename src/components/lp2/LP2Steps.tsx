import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { CORE_APP_URL } from "@/lib/constants";
import { buildCoreAppUrl } from "@/lib/url-utils";

const STEPS = [
  {
    num: "01",
    color: "#7610DC",
    title: "Crie seu perfil de co-founder",
    desc: "Defina suas habilidades, arquétipo (Builder ou Seller) e o que busca no sócio ideal. Leva 2 minutos.",
  },
  {
    num: "02",
    color: "#7610DC",
    title: "Receba matches por compatibilidade",
    desc: "Nossa IA analisa portfólios, skills e objetivos para sugerir co-founders com maior complementaridade ao seu perfil.",
  },
  {
    num: "03",
    color: "#F97316",
    title: "Valide sua ideia e construa o MVP",
    desc: "Escolha seu match, alinhem equity e expectativas, e partam para a validação de ideia e construção do MVP juntos.",
  },
];

const StepCard = ({ step, style }: { step: typeof STEPS[0]; style?: React.CSSProperties }) => (
  <div style={{
    background: "#FFFFFF",
    border: "1px solid #E4D9F5",
    borderRadius: 20,
    boxShadow: "0 4px 24px rgba(118,16,220,0.06)",
    ...style,
  }}>
    <p className="font-serif font-thin" style={{ fontSize: 56, fontWeight: 100, color: step.color, margin: "0 0 16px", lineHeight: 1 }}>
      {step.num}
    </p>
    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 18, fontWeight: 700, color: "#0A0B24", margin: "0 0 12px" }}>
      {step.title}
    </p>
    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, color: "#3D3D5C", lineHeight: 1.6, margin: 0 }}>
      {step.desc}
    </p>
  </div>
);

/* ── Mobile sticky scroll ── */
const MobileSticky = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrolled = -rect.top;
    const total = el.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / total));
    const idx = Math.min(2, Math.floor(progress * 3));
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const getCardStyle = (i: number): React.CSSProperties => {
    const isPast = i < activeIndex;
    const isCurrent = i === activeIndex;
    return {
      position: "absolute",
      width: "100%",
      maxWidth: 380,
      padding: "36px 28px",
      top: "50%",
      left: "50%",
      opacity: isCurrent ? 1 : 0,
      transform: isPast
        ? "translate(-50%, -50%) translateY(-110vh)"
        : isCurrent
        ? "translate(-50%, -50%)"
        : "translate(-50%, -50%) translateY(40px)",
      transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
      zIndex: isCurrent ? 2 : 1,
    };
  };

  return (
    <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        gap: 24,
      }}>
        {/* Header inside sticky */}
        <SectionHeader />

        {/* Cards stack */}
        <div style={{ position: "relative", width: "100%", maxWidth: 380, height: 280, flexShrink: 0 }}>
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} style={getCardStyle(i)} />
          ))}
        </div>

        {/* Chevron bounce */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          opacity: activeIndex < 2 ? 0.7 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <ChevronDown
            size={28}
            color="#7610DC"
            style={{
              animation: "lp2-chevron-bounce 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ── Desktop static grid ── */
const DesktopGrid = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dashedBg = "repeating-linear-gradient(to right, #C4B0E8 0px, #C4B0E8 6px, transparent 6px, transparent 12px)";

  return (
    <div
      ref={ref}
      className="grid grid-cols-3"
      style={{ gap: 20, maxWidth: 960, margin: "56px auto 0", position: "relative" }}
    >
      {/* Dashed connectors between cards */}
      {[0, 1].map((idx) => (
        <div
          key={`dash-${idx}`}
          style={{
            position: "absolute",
            top: 92,
            left: `calc(${(idx + 1) * 33.333}% - 10px)`,
            width: 20,
            height: 2,
            background: dashedBg,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {STEPS.map((step, i) => (
        <div
          key={step.num}
          style={{
            position: "relative",
            background: "#FFFFFF",
            border: "1px solid #E4D9F5",
            borderRadius: 20,
            padding: "40px 32px",
            boxShadow: "0 4px 24px rgba(118,16,220,0.06)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: `transform 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 120}ms, opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 120}ms`,
          }}
        >
          <p className="font-serif font-thin" style={{ fontSize: 72, fontWeight: 100, color: step.color, margin: "0 0 16px", lineHeight: 1 }}>
            {step.num}
          </p>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 18, fontWeight: 700, color: "#0A0B24", margin: "0 0 12px" }}>
            {step.title}
          </p>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, color: "#3D3D5C", lineHeight: 1.6, margin: 0 }}>
            {step.desc}
          </p>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ className }: { className?: string }) => (
  <div style={{ textAlign: "center", position: "relative", zIndex: 2 }} className={className}>
    <h2
      className="font-serif font-thin"
      style={{
        fontSize: "clamp(36px, 5vw, 64px)",
        fontWeight: 400,
        color: "#0A0B24",
        maxWidth: 800,
        margin: "0 auto",
        lineHeight: 0.95,
      }}
    >
      Encontre seu sócio em 3 passos.
    </h2>
    <p
      style={{
        fontFamily: "Montserrat, sans-serif",
        fontSize: 17,
        color: "#3D3D5C",
        maxWidth: 560,
        margin: "12px auto 0",
        lineHeight: 1.6,
      }}
    >
      Sem networking aleatório. Sem esperar meses. Match direto entre quem constrói e quem vende — por compatibilidade de perfil.
    </p>
  </div>
);

const LP2Steps = () => {
  return (
    <section id="como-funciona" style={{ background: "#FFFBF7" }}>
      {/* Desktop header — outside sticky */}
      <div className="hidden md:block" style={{ padding: "80px 24px 0", textAlign: "center" }}>
        <SectionHeader />
      </div>

      {/* Mobile: sticky scroll (header inside) */}
      <div className="block md:hidden">
        <MobileSticky />
      </div>

      {/* Desktop: static grid */}
      <div className="hidden md:block" style={{ paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <DesktopGrid />

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <button
            onClick={() => { window.location.href = buildCoreAppUrl(CORE_APP_URL, "/auth?view=signup"); }}
            style={{
              background: "#F97316",
              color: "#FFFFFF",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 100,
              padding: "16px 40px",
              border: "none",
              cursor: "pointer",
              transition: "background 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e0650f")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F97316")}
          >
            Encontrar meu Co-founder →
          </button>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#8A8AA8", marginTop: 12 }}>
            Comece grátis. Matches entre Builders e Sellers baseados em compatibilidade de skills.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LP2Steps;
