import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import heroIllustration from "@/assets/aceleracao-hero-illustration.png";
// @ts-ignore - vite-imagetools query
import heroWebp from "@/assets/aceleracao-hero-illustration.png?format=webp";

const Aceleracao2Hero = () => {
  const handleApply = () => {
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  };

  return (
    <section className="min-h-[calc(100vh-64px)] relative overflow-hidden" style={{ background: '#FEFBFD' }}>
      <Helmet>
        <link rel="preload" as="image" href={heroWebp} type="image/webp" />
      </Helmet>

      {/* Subtle decorative gradient */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(118,16,220,0.04) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(118,16,220,0.03) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-12 pt-[100px] md:pt-[120px] pb-16 md:pb-0">
        <div className="flex flex-col md:flex-row items-center md:items-center md:min-h-[calc(100vh-64px-120px)] gap-10 md:gap-8">

          {/* Left — Text content (55%) */}
          <div className="w-full md:w-[55%] flex flex-col gap-0">
            <motion.h1
            className="text-[28px] md:text-[56px] lg:text-[64px] leading-[1.08] text-[#0A0B24]"
              style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              De Ideia a MVP em{" "}
              <span className="text-[#F97316]">15 Dias</span>.
              <br />
              Encontre seu{" "}
              <span className="text-[#7610DC]">Co-fundador</span>.
            </motion.h1>

            <motion.p
              className="mt-6 text-[16px] md:text-[18px] leading-[1.6] text-[#4A4A68] max-w-[480px]"
              style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              O programa de aceleração gratuito para Builders e Sellers que querem montar startups reais, não apenas ideias.
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <button
                onClick={handleApply}
                className="w-full md:w-auto bg-[#7610DC] hover:bg-[#4308B0] text-white font-bold text-base md:text-lg px-8 py-4 rounded-xl transition-colors duration-200"
                style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
              >
                Aplicar para a Aceleração →
              </button>
            </motion.div>

            <motion.p
              className="mt-4 text-[13px] text-[#6B7280]"
              style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              Vagas limitadas. Próximo cohort começa em breve.
            </motion.p>
          </div>

          {/* Right — Illustration (45%) */}
          <motion.div
            className="w-[70%] md:w-[40%] flex items-center justify-start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <picture>
              <source srcSet={heroWebp} type="image/webp" />
              <img
                src={heroIllustration}
                alt="Dois co-fundadores colaborando em um laptop — Builder e Seller construindo juntos"
                className="w-full h-auto max-w-[440px]"
                loading="eager"
              />
            </picture>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Aceleracao2Hero;
