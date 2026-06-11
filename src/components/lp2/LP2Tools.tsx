import { useRef, useState, useEffect } from "react";
import { PieChart, DollarSign, Code2 } from "lucide-react";

const TOOLS = [
  {
    icon: PieChart,
    title: "Calculadora de Equity",
    description:
      "Divida equity com justiça. Simule cenários e evite conflitos futuros entre sócios.",
    cta: "Calcular agora →",
    href: "/tools/equity",
  },
  {
    icon: DollarSign,
    title: "Simulador de Valuation",
    description:
      "Quanto vale sua startup hoje? Descubra antes de negociar com investidores.",
    cta: "Simular valor →",
    href: "/tools/valuation",
  },
  {
    icon: Code2,
    title: "Gerador de Vesting",
    description:
      "Proteja sua empresa com contratos de vesting simples e claros.",
    cta: "Gerar contrato →",
    href: "/tools/vesting",
  },
];

const LP2Tools = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "#EDE0FF",
        borderRadius: 24,
        padding: "64px 48px",
      }}
      className="max-md:!px-6 max-md:!py-10"
    >
      {/* Header */}
      <div
        className="flex flex-col md:flex-row md:items-end"
        style={{ gap: 24, marginBottom: 48 }}
      >
        <div className="flex-1 min-w-0">
          <h2
            className="font-serif font-thin"
            style={{
              fontSize: "clamp(28px, 6vw, 48px)",
              fontWeight: 400,
              color: "#0A0B24",
              maxWidth: 520,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Ferramentas gratuitas para empreendedores e startups
          </h2>
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 15,
              color: "#3D3D5C",
              maxWidth: 480,
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            Calculadoras de equity, valuation, runway e simuladores que ajudam
            founders a tomar decisões difíceis antes de errar caro.
          </p>
        </div>

        <a
          href="/tools"
          className="hidden md:inline-flex flex-shrink-0 whitespace-nowrap no-underline transition-opacity duration-200 hover:underline hover:opacity-80"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#7610DC",
          }}
        >
          Explorar todas as ferramentas para startups →
        </a>
      </div>

      {/* Cards grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: 16 }}
      >
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.title}
              className="group"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4D9F5",
                borderRadius: 16,
                padding: "32px 28px",
                boxShadow: "0 4px 20px rgba(118,16,220,0.06)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 100}ms`,
                transitionProperty: "opacity, transform, box-shadow",
                transitionDuration: "0.5s, 0.5s, 0.2s",
                transitionTimingFunction:
                  "cubic-bezier(0.4,0,0.2,1), cubic-bezier(0.4,0,0.2,1), ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(118,16,220,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(118,16,220,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Icon
                size={28}
                style={{ color: "#7610DC", marginBottom: 16 }}
              />
              <h3
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0A0B24",
                  marginBottom: 8,
                }}
              >
                {tool.title}
              </h3>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  color: "#3D3D5C",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {tool.description}
              </p>
              <a
                href={tool.href}
                className="no-underline transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#7610DC",
                }}
              >
                {tool.cta}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LP2Tools;
