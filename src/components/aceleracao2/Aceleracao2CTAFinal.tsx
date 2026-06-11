import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";

const Aceleracao2CTAFinal = () => {
  return (
    <section id="inscrever" className="py-12 md:py-[120px]" style={{ background: "#7610DC" }}>
      <div className="max-w-[800px] mx-auto px-5 md:px-12 text-center">
        {/* Headline */}
        <motion.h2
          {...fadeUp(25, 0)}
          className="text-[36px] md:text-[56px] leading-[1.15] text-white"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Pronto para o{" "}
          <br />
          <span style={{ color: "#F97316" }}>Desafio?</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(20, 0.1)}
          className="mt-5 text-[16px] md:text-[18px] leading-[1.6] max-w-[520px] mx-auto"
          style={{
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Montserrat', 'Inter', sans-serif",
          }}
        >
          15 dias. Seu co-fundador. Seu MVP. Sua primeira venda. Sem enrolação.
        </motion.p>

        {/* Embedded Form */}
        <motion.div
          {...fadeUp(20, 0.2)}
          className="mt-12 mx-auto max-w-[580px] rounded-[20px] p-4 md:p-6 overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <iframe
            width="100%"
            height="305"
            src="https://dfffdb35.sibforms.com/serve/MUIFAOFz3ZkYwytdwKZyv0YWeuGjPzzkGWQN7EGDQ8y_ef_Uv6itrm2j3SQNtJA5cZqW1O6HHDyDt_G3OPSP_ke5lB1cnzaAZLlynNrdsdD9mupgvTUBbDiTXIhTiWwC7w1hFtr3--Ba1yXRlFIUfGZyiZl8gkLskduJIt_0QWXz6Lgbi2mj7FzaPsGOPk6d8jYnhxhMvyzcQj1i9w=="
            frameBorder="0"
            scrolling="auto"
            allowFullScreen
            style={{ display: "block", maxWidth: "100%", borderRadius: "12px" }}
            title="Formulário de inscrição - Aceleração Guilda"
          />
        </motion.div>

        {/* Micro-copy */}
        <motion.p
          {...fadeUp(15, 0.3)}
          className="mt-6 text-[13px]"
          style={{
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Montserrat', 'Inter', sans-serif",
          }}
        >
          Vagas limitadas por cohort. Entraremos em contato.
        </motion.p>
      </div>
    </section>
  );
};

export default Aceleracao2CTAFinal;
