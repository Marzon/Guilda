import { motion } from "framer-motion";
import { Puzzle, Clock, TrendingUp } from "lucide-react";
import communityImg from "@/assets/lp2-community-group.png";

const DIFFERENTIALS = [
  {
    icon: Puzzle,
    title: "Match por portfólio",
    description: "Conexão baseada em habilidades complementares, não sorte.",
  },
  {
    icon: Clock,
    title: "Disponibilidade real",
    description: "Só entra quem tem tempo e compromisso para construir.",
  },
  {
    icon: TrendingUp,
    title: "Skin in the game",
    description: "Vesting, equity e responsabilidade desde o dia zero.",
  },
];

const LP2Manifesto = () => {
  return (
    <section>
      <div
        className="w-full text-center flex flex-col items-center overflow-hidden"
        style={{
          background: "#EDE0FF",
          borderRadius: 24,
          paddingTop: 72,
          paddingBottom: 0,
        }}
      >
        {/* Headline */}
        <motion.h2
          className="font-serif font-thin leading-[0.95] tracking-tight px-6"
          style={{ fontSize: "clamp(36px, 5.5vw, 72px)", color: "#0A0B24" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="italic" style={{ color: "#7610DC" }}>Builders</span>
          {" "}+{" "}
          <span className="italic" style={{ color: "#F97316" }}>Sellers</span>
          <br />
          têm mais chance de sucesso juntos
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="font-sans leading-relaxed px-6"
          style={{
            fontSize: 17,
            color: "#3D3D5C",
            maxWidth: 580,
            marginTop: 20,
            marginBottom: 48,
            lineHeight: 1.6,
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Startups não falham por falta de ideia. Falham por falta de time. A Guilda resolve isso com match real entre quem constrói e quem vende.
        </motion.p>

        {/* Illustration */}
        <motion.img
          src={communityImg}
          alt="Dois co-fundadores colaborando — Builder e Seller trabalhando juntos"
          loading="lazy"
          width={800}
          height={420}
          className="w-full"
          style={{
            maxHeight: 420,
            objectFit: "contain",
            objectPosition: "center bottom",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* Differentials */}
        <div
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-6 md:px-12"
          style={{ paddingTop: 40, paddingBottom: 56, borderTop: "1px solid rgba(118,16,220,0.1)" }}
        >
          {DIFFERENTIALS.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              className="flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <Icon size={24} style={{ color: "#7610DC" }} />
              <span
                className="font-bold"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, color: "#0A0B24" }}
              >
                {title}
              </span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#3D3D5C" }}>
                {description}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LP2Manifesto;
