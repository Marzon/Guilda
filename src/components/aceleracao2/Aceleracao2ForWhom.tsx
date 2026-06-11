import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";
import { LazyImage } from "@/components/LazyImage";
import builderImg from "@/assets/aceleracao-builder-profile.png";
import sellerImg from "@/assets/aceleracao-seller-profile.png";
// @ts-ignore - vite-imagetools query
import builderWebp from "@/assets/aceleracao-builder-profile.png?format=webp";
// @ts-ignore - vite-imagetools query
import sellerWebp from "@/assets/aceleracao-seller-profile.png?format=webp";

const BUILDER_CHECKS = [
  "Tem uma ideia ou MVP, mas zero clientes",
  "Já tentou vender e não funcionou",
  "Prefere codar a fazer cold call",
  "Quer um sócio que cuide de vendas e crescimento",
];

const SELLER_CHECKS = [
  "Tem visão de negócio, mas não sabe codar",
  "Já tentou no-code e não escalou",
  "Cansou de networking que não dá em nada",
  "Quer um sócio técnico comprometido de verdade",
];

const CheckItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3">
    <span
      className="mt-0.5 flex-shrink-0 font-bold text-[15px]"
      style={{ color: '#7610DC' }}
    >
      ✓
    </span>
    <span
      className="text-[14px] md:text-[15px] text-[#0A0B24] leading-[1.5]"
      style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
    >
      {text}
    </span>
  </li>
);

const Aceleracao2ForWhom = () => {
  const handleApply = () => {
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  };

  return (
    <section id="para-quem" style={{ background: '#F9F5FC' }} className="py-12 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        {/* Badge */}
        <motion.div {...fadeUp(20, 0)} className="flex justify-center mb-6">
          <span
            className="text-[12px] font-semibold tracking-[2px] uppercase px-5 py-2 rounded-full"
            style={{
              color: '#7610DC',
              background: 'rgba(118,16,220,0.08)',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
          >
            PARA QUEM É
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          {...fadeUp(25, 0.1)}
          className="text-[32px] md:text-[48px] lg:text-[56px] leading-[1.1] text-center text-[#0A0B24]"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Feito para quem quer<br />
          <span className="text-[#F97316]">construir, não só sonhar.</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(20, 0.2)}
          className="mt-4 text-center text-[16px] md:text-[18px] leading-[1.6] text-[#4A4A68] max-w-[600px] mx-auto"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          Se você se reconhece em um desses perfis, a Aceleração foi desenhada pra você.
        </motion.p>

        {/* Two columns */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row gap-12 md:gap-0">
          {/* Builder */}
          <motion.div
            {...fadeUp(30, 0.25)}
            className="flex-1 flex flex-col items-center md:items-start md:pr-12"
          >
            <motion.div
              className="w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <LazyImage
                src={builderImg}
                webpSrc={builderWebp}
                alt="Builder codando no laptop — ilustração line-art roxa"
                className="max-h-[220px] md:max-h-[280px] w-auto object-contain"
                containerClassName="h-[220px] md:h-[280px] flex items-center justify-center"
              />
            </motion.div>
            <h3
              className="mt-8 text-[24px] md:text-[28px] font-bold text-[#0A0B24]"
              style={{ fontFamily: "'Telegraf', 'Inter', sans-serif" }}
            >
              🛠️ Eu sou Builder
            </h3>
            <p
              className="mt-3 text-[16px] leading-[1.6] text-[#4A4A68]"
              style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
            >
              Dev, engenheiro ou PM com habilidade técnica. Sabe construir — mas precisa de alguém que saiba vender.
            </p>
            <ul className="mt-6 space-y-4 w-full">
              {BUILDER_CHECKS.map((item) => (
                <CheckItem key={item} text={item} />
              ))}
            </ul>
          </motion.div>

          {/* Vertical divider (desktop) / Horizontal divider (mobile) */}
          <div className="hidden md:block w-px bg-[#E5E5E5] flex-shrink-0" />
          <hr className="md:hidden border-[#E5E5E5]" />

          {/* Seller */}
          <motion.div
            {...fadeUp(30, 0.35)}
            className="flex-1 flex flex-col items-center md:items-start md:pl-12"
          >
            <motion.div
              className="w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            >
              <LazyImage
                src={sellerImg}
                webpSrc={sellerWebp}
                alt="Seller apresentando plano de negócios — ilustração line-art roxa"
                className="max-h-[220px] md:max-h-[280px] w-auto object-contain"
                containerClassName="h-[220px] md:h-[280px] flex items-center justify-center"
              />
            </motion.div>
            <h3
              className="mt-8 text-[24px] md:text-[28px] font-bold text-[#0A0B24]"
              style={{ fontFamily: "'Telegraf', 'Inter', sans-serif" }}
            >
              📈 Eu sou Seller
            </h3>
            <p
              className="mt-3 text-[16px] leading-[1.6] text-[#4A4A68]"
              style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
            >
              Profissional de vendas, marketing ou growth. Sabe gerar receita — mas precisa de quem construa o produto.
            </p>
            <ul className="mt-6 space-y-4 w-full">
              {SELLER_CHECKS.map((item) => (
                <CheckItem key={item} text={item} />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div {...fadeUp(20, 0.5)} className="mt-16 flex flex-col items-center text-center">
          <p
            className="text-[18px] text-[#4A4A68]"
            style={{ fontFamily: "'Montserrat', 'Inter', sans-serif", fontWeight: 500 }}
          >
            Builder ou Seller — o primeiro passo é o mesmo.
          </p>
          <button
            onClick={handleApply}
            className="mt-5 text-white font-semibold text-[16px] px-10 py-[18px] rounded-xl transition-all duration-200 hover:scale-[1.02] w-full max-w-[400px] md:w-auto"
            style={{
              background: '#7610DC',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4308B0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#7610DC')}
          >
            Aplicar para a Aceleração →
          </button>
          <p
            className="mt-3 text-[14px] text-[#9090A7]"
            style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
          >
            Gratuito para começar. Vagas limitadas por cohort.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Aceleracao2ForWhom;
