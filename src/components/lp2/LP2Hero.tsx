import { motion } from "framer-motion";
import heroIllustration from "@/assets/lp2-hero-partnership.png";

const LP2Hero = () => {
  return (
    <section className="overflow-hidden bg-lp2-bg">
      <div
        className="grid grid-cols-1 md:grid-cols-2 items-center"
        style={{ gap: 48 }}
      >
        {/* Left — Text */}
        <div className="flex flex-col" style={{ zIndex: 2, maxWidth: 600 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p
              className="font-serif font-thin whitespace-nowrap"
              style={{
                fontSize: "clamp(36px, 5vw, 72px)",
                fontWeight: 100,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: "#7610DC",
                margin: 0,
              }}
            >
              Encontre seu sócio.
            </p>
            <p
              className="font-serif font-thin whitespace-nowrap"
              style={{
                fontSize: "clamp(36px, 5vw, 72px)",
                fontWeight: 100,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: "#7610DC",
                margin: 0,
              }}
            >
              Construa sua startup.
            </p>
          </motion.div>

          <motion.p
            className="font-sans"
            style={{ fontSize: 17, lineHeight: 1.6, color: "#3D3D5C", maxWidth: 480, marginTop: 24 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            A plataforma que conecta Builders e Sellers para formar duplas de co-fundadores com match real, não por sorte.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center"
            style={{ marginTop: 36, gap: 24 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a
              href="https://suprema.guilda.app.br/auth?view=signup"
              className="text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 no-underline"
              style={{
                padding: "14px 28px",
                borderRadius: 100,
                background: "#F97316",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                cursor: "pointer",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 16,
                display: "inline-block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e0650f")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F97316")}
            >
              Encontrar meu Sócio
            </a>

            <a
              href="https://suprema.guilda.app.br/auth?view=signup"
              className="font-semibold transition-colors duration-200"
              style={{
                color: "#7610DC",
                textDecoration: "none",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 16,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Criar perfil grátis
            </a>
          </motion.div>
        </div>

        {/* Right — Illustration */}
        <motion.div
          className="flex items-center justify-center overflow-hidden"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <img
            src={heroIllustration}
            alt="Dois co-fundadores colaborando — Builder e Seller construindo juntos"
            className="w-full h-auto"
            style={{ maxHeight: 480, objectFit: "contain" }}
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default LP2Hero;
