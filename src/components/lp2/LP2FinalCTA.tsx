import { motion } from "framer-motion";
import builderImg from "@/assets/lp2-builder-thinking.png";
import duoImg from "@/assets/lp2-duo-partners.png";

const LP2FinalCTA = () => {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>

        {/* Card 1 — Light (Builders) */}
        <motion.div
          className="bg-white border border-lp2-border flex flex-col md:flex-row items-center gap-6 order-2 md:order-1"
          style={{
            borderRadius: "var(--lp2-radius-card)",
            padding: "var(--lp2-sp-5)",
            boxShadow: "0 8px 32px rgba(118, 16, 220, 0.08)",
            minHeight: 220,
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={builderImg}
            alt="Builder pensativo no computador"
            loading="lazy"
            width={120}
            height={140}
            className="w-[120px] h-[140px] object-contain flex-shrink-0"
          />
          <div className="flex flex-col gap-3 min-w-0">
            <span
              className="self-start font-sans font-semibold text-lp2-primary"
              style={{
                fontSize: 12,
                background: "#EDE0FF",
                padding: "4px 12px",
                borderRadius: "var(--lp2-radius-pill)",
              }}
            >
              Para Builders
            </span>
            <h3 className="font-telegraf font-bold text-lp2-text" style={{ fontSize: 24, lineHeight: 1.2 }}>
              Seu produto merece um sócio comercial
            </h3>
            <p className="font-sans text-sm text-lp2-text-secondary leading-relaxed">
              Você constrói. A gente encontra quem vende por você.
            </p>
          </div>
        </motion.div>

        {/* Card 2 — Dark (Sellers) */}
        <motion.div
          className="relative overflow-hidden flex flex-col md:flex-row items-center gap-6 order-1 md:order-2"
          style={{
            background: "#0A0B24",
            borderRadius: "var(--lp2-radius-card)",
            padding: "var(--lp2-sp-5)",
            minHeight: 220,
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(118,16,220,0.2) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 flex flex-col gap-3 min-w-0 flex-1">
            <span
              className="self-start font-sans font-semibold"
              style={{
                fontSize: 12,
                background: "rgba(249,115,22,0.2)",
                color: "#F97316",
                padding: "4px 12px",
                borderRadius: "var(--lp2-radius-pill)",
              }}
            >
              Para Sellers
            </span>
            <h3 className="font-telegraf font-bold text-white" style={{ fontSize: 24, lineHeight: 1.2 }}>
              Você vende. A gente encontra seu sócio técnico.
            </h3>
            <p className="font-sans text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              Conecte-se com builders prontos para construir seu produto.
            </p>
            <a
              href="https://suprema.guilda.app.br/auth?view=signup"
              className="self-start bg-lp2-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-lp2-primary-dark hover:-translate-y-0.5 no-underline"
              style={{
                padding: "12px 24px",
                borderRadius: "var(--lp2-radius-pill)",
                display: "inline-block",
              }}
            >
              Criar perfil grátis
            </a>
          </div>

          <img
            src={duoImg}
            alt="Dupla de co-fundadores — Builder e Seller juntos"
            loading="lazy"
            width={120}
            height={140}
            className="relative z-10 w-[120px] h-[140px] object-contain flex-shrink-0"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default LP2FinalCTA;
