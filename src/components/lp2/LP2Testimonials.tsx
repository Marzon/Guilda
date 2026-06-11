import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import avatarStela from "@/assets/testimonials/stela.png";
import avatarFernando from "@/assets/testimonials/fernando.jpg";
import avatarBruno from "@/assets/testimonials/bruno_souto_oliveira.jpg";
import avatarMatheus from "@/assets/testimonials/matheus.png";
import avatarRondinelly from "@/assets/testimonials/rondinelly_santos.jpg";
import avatarRenan from "@/assets/testimonials/renanmanao.png";
import avatarPablo from "@/assets/testimonials/pablo_rodnitzky.jpg";
import avatarNeivam from "@/assets/testimonials/neivam_carvalho.jpg";
import avatarMarzon from "@/assets/testimonials/marzon.png";

const TESTIMONIALS = [
{ quote: "Economizei mais de 10h por semana buscando um co-founder. Com a Guilda, em minutos, me conectei com pessoas qualificadas. Encontrei meu CTO e agora estamos nos próximos passos pra crescer nossa base.", name: "@stela", role: "Seller · Growth", avatar: avatarStela },
{ quote: "Ao ser membro da Guilda, consegui ser co-founder de um projeto, validei duas ideias que pareciam promissoras e não eram, economizando R$50.000 e 3 meses de tempo. Me sinto pronto e motivado a iniciar um novo negócio.", name: "@fernando", role: "Builder · Dev Full-Stack", avatar: avatarFernando },
{ quote: "Encontrei um sócio em menos de uma semana depois de meses procurando. Agora tenho um sócio tech que me complementa. A IA que relaciona os perfis é o diferencial.", name: "@bruno_souto_oliveira", role: "Seller · Negócios", avatar: avatarBruno },
{ quote: "Já conquistei um novo cliente, elevando minha base para 6 pagantes. Sei exatamente onde meu negócio está e quais são os próximos passos. A Guilda é o atalho para quem busca clareza estratégica.", name: "@Matheus", role: "Builder · Produto", avatar: avatarMatheus },
{ quote: "Economizei 6 meses com um projeto de 15 dias. Percebi que estava insistindo num caminho errado. Através dos exercícios e mentoria, voltei à prancheta com muito mais clareza.", name: "@rondinelly_santos", role: "Builder · Dev", avatar: avatarRondinelly },
{ quote: "Fiz grandes contatos em menos de uma semana. Entrei para validar uma ideia, fiz conexão com outro founder e estamos estudando possibilidades juntos. Se você busca crescimento acelerado, não conheço outro lugar.", name: "@renanmanao", role: "Seller · Growth", avatar: avatarRenan },
{ quote: "A Guilda conecta empreendedores e devs de forma simples e fácil. Fiz contato com vários devs. Diria para não perder tempo e usar a Guilda.", name: "@pablo_rodnitzky", role: "Seller · Vendas", avatar: avatarPablo },
{ quote: "Linkedin voltado a founders. Direto, rápido, sem disneyland. Volto aqui todos os dias. Melhorou muito o dia a dia.", name: "@neivam_carvalho", role: "Seller · Vendas", avatar: avatarNeivam },
{ quote: "Economizei pelo menos 2 meses de trabalho validando a ideia conversando com possíveis clientes. Me sinto com mais visão do topo e abertura de novas ideias. A rede de contatos permanece.", name: "@Marzon Castilho", role: "Builder · Produto", avatar: avatarMarzon }];


const LP2Testimonials = () => {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload all avatar images on mount
  useEffect(() => {
    TESTIMONIALS.forEach(({ avatar }) => {
      const img = new Image();
      img.src = avatar;
    });
  }, []);

  const goTo = useCallback((indexFn: (prev: number) => number) => {
    setVisible(false);
    setTimeout(() => {
      setActive(indexFn);
      setVisible(true);
    }, 250);
  }, []);

  const next = useCallback(() => goTo((p) => (p + 1) % TESTIMONIALS.length), [goTo]);
  const prev = useCallback(() => goTo((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), [goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const t = TESTIMONIALS[active];

  return (
    <section
      style={{
        background: "#0A0B24",
        borderRadius: 24,
        padding: "80px 48px",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(118,16,220,0.10) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
      

      {/* Label pill */}
      <div style={{ textAlign: "center", marginBottom: 20, position: "relative", zIndex: 1 }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(118,16,220,0.25)",
            color: "#A728EB",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 100,
            padding: "6px 16px"
          }}>
          
          Founders que já encontraram seu sócio
        </span>
      </div>

      {/* Headline */}
      <h2
        className="font-serif font-thin"
        style={{
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 100,
          color: "#FFFFFF",
          textAlign: "center",
          margin: "0 auto 48px",
          maxWidth: 700,
          lineHeight: 0.95,
          position: "relative",
          zIndex: 1
        }}>
        Quem já entrou, <br />
não volta a buscar sozinho.
      </h2>

      {/* Card + arrows wrapper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          position: "relative",
          zIndex: 1
        }}>
        
        {/* Left arrow — hidden on mobile */}
        <button
          onClick={prev}
          aria-label="Anterior"
          className="hidden md:flex"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "none",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 200ms ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(118,16,220,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
          
          <ChevronLeft size={20} color="rgba(255,255,255,0.6)" />
        </button>

        {/* Quote card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 20,
            padding: "48px",
            maxWidth: 640,
            width: "100%"
          }}
          className="!p-7 md:!p-12">


          <div key={active} style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}>
            {/* Opening quote mark */}
            <span
              className="font-serif font-thin"
              style={{
                fontSize: 72,
                color: "#7610DC",
                opacity: 0.4,
                lineHeight: 0.8,
                display: "block",
                marginBottom: 8,
                userSelect: "none"
              }}>
              "
            </span>

            {/* Quote text */}
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 17,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.7,
                margin: 0,
                minHeight: 100
              }}>
              {t.quote}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

            {/* Author row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={t.avatar}
                alt={t.name}
                loading="lazy"
                width={44}
                height={44}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "2px solid #7610DC",
                  objectFit: "cover",
                  flexShrink: 0
                }} />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    margin: 0
                  }}>
                  {t.name}
                </p>
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0
                  }}>
                  {t.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right arrow — hidden on mobile */}
        <button
          onClick={next}
          aria-label="Próximo"
          className="hidden md:flex"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "none",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 200ms ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(118,16,220,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
          
          <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
        </button>
      </div>

      {/* Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 28,
          position: "relative",
          zIndex: 1
        }}>
        
        {TESTIMONIALS.map((_, i) =>
        <button
          key={i}
          onClick={() => goTo(() => i)}
          aria-label={`Depoimento ${i + 1}`}
          style={{
            height: 8,
            width: i === active ? 24 : 8,
            borderRadius: 100,
            background: i === active ? "#7610DC" : "rgba(255,255,255,0.25)",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.3s ease"
          }} />

        )}
      </div>
    </section>);

};

export default LP2Testimonials;