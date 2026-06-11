import { useRef, useEffect, useState } from "react";
import { Zap, Swords } from "lucide-react";

const builderSkills = [
  { name: "Backend", value: 90 },
  { name: "Frontend", value: 70 },
  { name: "IA/ML", value: 60 },
];
const sellerSkills = [
  { name: "Growth", value: 85 },
  { name: "Vendas B2B", value: 80 },
  { name: "Produto", value: 50 },
];

const builderTags = ["Backend", "Frontend", "IA/ML"];
const sellerTags = ["Growth", "Vendas B2B", "Produto"];

/* ── Mobile Simplified Card (same as LP1) ── */
const MiniCard = ({
  type, badge, name, desc, tags, visible, direction = "left",
}: {
  type: "builder" | "seller"; badge: string; name: string; desc: string;
  tags: string[]; visible: boolean; direction?: "left" | "right";
}) => {
  const isBuilder = type === "builder";
  const cardBg = isBuilder ? "#7610DC" : "#F97316";
  const shadowColor = isBuilder ? "rgba(118, 16, 220, 0.3)" : "rgba(249, 115, 22, 0.3)";
  const translateFrom = direction === "left" ? "translateX(-60px)" : "translateX(60px)";

  return (
    <div
      className="rounded-xl p-4 transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: cardBg,
        boxShadow: `0 4px 16px ${shadowColor}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : translateFrom,
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
      }}
    >
      <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 bg-white" style={{ color: cardBg }}>
        {badge}
      </span>
      <h3 className="text-white font-bold text-lg mb-0.5">{name}</h3>
      <p className="text-[rgba(255,255,255,0.75)] text-xs line-clamp-1 mb-3">{desc}</p>
      <div className="flex flex-col gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded-md font-medium bg-[rgba(255,255,255,0.15)] text-white border border-[rgba(255,255,255,0.25)] text-center">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Desktop Full Card (same as LP1) ── */
const FullCard = ({
  type, badge, name, desc, skills, search, availability, matches, visible, direction = "left",
}: {
  type: "builder" | "seller"; badge: string; name: string; desc: string;
  skills: { name: string; value: number }[]; search: string; availability: string;
  matches: number; visible: boolean; direction?: "left" | "right";
}) => {
  const isBuilder = type === "builder";
  const cardBg = isBuilder ? "#7610DC" : "#F97316";
  const shadowColor = isBuilder ? "rgba(118, 16, 220, 0.3)" : "rgba(249, 115, 22, 0.3)";
  const shadowHover = isBuilder ? "rgba(118, 16, 220, 0.5)" : "rgba(249, 115, 22, 0.5)";
  const translateFrom = direction === "left" ? "translateX(-80px)" : "translateX(80px)";

  return (
    <div
      className="rounded-2xl p-6 lg:p-8 hover:-translate-y-1 transition-all duration-300"
      style={{
        backgroundColor: cardBg,
        boxShadow: `0 4px 24px ${shadowColor}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : translateFrom,
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px ${shadowHover}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 24px ${shadowColor}`; }}
    >
      <span className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 bg-white" style={{ color: cardBg }}>
        {badge}
      </span>
      <h3 className="text-white font-bold text-xl lg:text-2xl mb-1">{name}</h3>
      <p className="text-[rgba(255,255,255,0.75)] text-sm mb-5">{desc}</p>

      <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-[rgba(255,255,255,0.5)]">Poderes</p>
      <div className="space-y-3 mb-5">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">{skill.name}</span>
              <span className="text-white font-semibold">{skill.value}%</span>
            </div>
            <div className="w-full h-2 bg-[rgba(255,255,255,0.15)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: visible ? `${skill.value}%` : "0%", transition: "width 1s ease-out 0.3s" }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-[rgba(255,255,255,0.5)]">Busca</p>
      <p className="text-sm text-white mb-5">{search}</p>

      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-[rgba(255,255,255,0.5)]">Disponibilidade</p>
      <p className="text-sm text-white mb-5 flex items-center gap-1.5">
        <Zap size={14} className="text-white" />
        {availability}
      </p>

      <div className="border-t border-[rgba(255,255,255,0.15)] pt-4">
        <p className="text-sm font-medium flex items-center gap-1.5 text-white">
          <Swords size={14} />
          {matches} matches encontrados
        </p>
      </div>
    </div>
  );
};

const LP2MatchProfiles = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: "#FFFBF7", padding: "80px 24px", overflow: "hidden" }}>
      {/* Label pill */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span
          style={{
            display: "inline-block",
            background: "#EDE0FF",
            color: "#7610DC",
            fontFamily: "Poppins, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 100,
            padding: "6px 16px",
          }}
        >
          Como funciona o match
        </span>
      </div>

      {/* Headline */}
      <h2
        className="font-serif font-thin"
        style={{
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 400,
          color: "#0A0B24",
          textAlign: "center",
          maxWidth: 700,
          margin: "0 auto 16px",
          lineHeight: 0.95,
        }}
      >
        Compatibilidade real:<br />skills, disponibilidade e visão.
      </h2>

      {/* Subtext */}
      <p
        style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: 17,
          color: "#3D3D5C",
          textAlign: "center",
          maxWidth: 560,
          margin: "0 auto 48px",
          lineHeight: 1.6,
        }}
      >
        Nada de formulários infinitos. A Guilda analisa seu perfil e conecta quem constrói com quem vende — por compatibilidade, não por sorte.
      </p>

      {/* Mobile cards */}
      <div className="md:hidden relative grid grid-cols-2 gap-3 max-w-md mx-auto mb-8">
        <MiniCard type="builder" badge="BUILDER" name="Lucas M." desc="Dev Full-Stack · Python · React" tags={builderTags} visible={visible} direction="left" />
        <MiniCard type="seller" badge="SELLER" name="Ana R." desc="Growth Marketing · B2B SaaS" tags={sellerTags} visible={visible} direction="right" />
        {/* Swords icon centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <Swords className="text-[#7610DC]" size={18} />
        </div>
      </div>

      {/* Desktop cards */}
      <div className="hidden md:block relative max-w-3xl mx-auto mb-8">
        <div className="grid grid-cols-2 gap-6">
          <FullCard
            type="builder" badge="BUILDER" name="Lucas M." desc="Dev Full-Stack · Python · React"
            skills={builderSkills} search="Seller com experiência em SaaS B2B"
            availability="Imediata — Full-time" matches={3} visible={visible} direction="left"
          />
          <FullCard
            type="seller" badge="SELLER" name="Ana R." desc="Growth Marketing · B2B SaaS"
            skills={sellerSkills} search="Builder com MVP de edtech ou fintech"
            availability="Imediata — Part-time" matches={5} visible={visible} direction="right"
          />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#F3F0FF] flex items-center justify-center shadow-sm">
          <Swords className="text-[#7610DC]" size={20} />
        </div>
      </div>

      {/* Footer text */}
      <p
        style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: 14,
          color: "#8A8AA8",
          fontStyle: "italic",
          textAlign: "center",
          margin: 0,
        }}
      >
        Perfis verificados. Compatibilidade real. Zero enrolação.
      </p>
    </section>
  );
};

export default LP2MatchProfiles;