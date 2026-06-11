import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";
import { LazyImage } from "@/components/LazyImage";
import quebracabecaImg from "@/assets/aceleracao-quebracabeca.png";
import iaImg from "@/assets/aceleracao-ia.png";
import plotterImg from "@/assets/aceleracao-plotter.png";
import comunidadeImg from "@/assets/aceleracao-comunidade.png";
import missoesImg from "@/assets/aceleracao-missoes.png";
import founderImg from "@/assets/aceleracao-founder.png";
// @ts-ignore - vite-imagetools query
import quebracabecaWebp from "@/assets/aceleracao-quebracabeca.png?format=webp";
// @ts-ignore - vite-imagetools query
import iaWebp from "@/assets/aceleracao-ia.png?format=webp";
// @ts-ignore - vite-imagetools query
import plotterWebp from "@/assets/aceleracao-plotter.png?format=webp";
// @ts-ignore - vite-imagetools query
import comunidadeWebp from "@/assets/aceleracao-comunidade.png?format=webp";
// @ts-ignore - vite-imagetools query
import missoesWebp from "@/assets/aceleracao-missoes.png?format=webp";
// @ts-ignore - vite-imagetools query
import founderWebp from "@/assets/aceleracao-founder.png?format=webp";

const BENEFITS = [
  {
    img: quebracabecaImg,
    webp: quebracabecaWebp,
    alt: "Peças de quebra-cabeça se encaixando — pareamento Builder + Seller",
    title: "Match Builder + Seller",
    desc: "Pareamento inteligente por portfólio, disponibilidade e compatibilidade. Nada de sorte.",
  },
  {
    img: iaImg,
    webp: iaWebp,
    alt: "Robô com headset — mentor de IA disponível 24/7",
    title: "Comandante IA (acesso 24/7)",
    desc: "Seu mentor de IA que responde dúvidas sobre tech, negócios e estratégia a qualquer hora.",
  },
  {
    img: plotterImg,
    webp: plotterWebp,
    alt: "Pessoa planejando em quadro — estratégia de produto e pivot",
    title: "Plotter IA (plano de pivot)",
    desc: "Estratégia de produto, roadmap e plano de validação personalizado para sua startup.",
  },
  {
    img: comunidadeImg,
    webp: comunidadeWebp,
    alt: "Videocall com várias pessoas — comunidade de founders",
    title: "Comunidade exclusiva",
    desc: "Acesse uma rede de founders que estão na mesma jornada. Troque experiências e parcerias.",
    large: true,
  },
  {
    img: missoesImg,
    webp: missoesWebp,
    alt: "Pessoa analisando documentos — missões diárias com feedback",
    title: "Missões diárias com feedback",
    desc: "Desafios diários para manter o ritmo. Cada missão te aproxima do lançamento.",
  },
  {
    img: founderImg,
    webp: founderWebp,
    alt: "Pessoa celebrando com balões — acesso premium founder por 6 meses",
    title: "6 meses founder (acesso premium)",
    desc: "Após a aceleração, mantenha acesso à plataforma Guilda como founder verificado por 6 meses.",
  },
];

const Aceleracao2Benefits = () => {
  const handleApply = () => {
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  };

  return (
    <section id="o-que-recebe" className="py-12 md:py-[120px]" style={{ background: '#7610DC' }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        {/* Badge */}
        <motion.div {...fadeUp(20, 0)} className="flex justify-center mb-6">
          <span
            className="text-[12px] font-semibold tracking-[2px] uppercase px-4 py-1.5 rounded-full"
            style={{
              color: '#FFFFFF',
              background: 'rgba(255,255,255,0.15)',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
          >
            O QUE VOCÊ RECEBE
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          {...fadeUp(25, 0.1)}
          className="text-[28px] md:text-[44px] lg:text-[52px] leading-[1.1] text-center text-white"
          style={{ fontFamily: "'PP Editorial New', Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Tudo que você precisa para sair da ideia<br className="hidden md:block" /> e chegar ao mercado.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(20, 0.2)}
          className="mt-4 text-center text-[16px] md:text-[18px] max-w-[500px] mx-auto"
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontFamily: "'Montserrat', 'Inter', sans-serif",
          }}
        >
          O programa mais completo para founders early-stage.
        </motion.p>

        {/* Grid */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              {...fadeUp(30, 0.2 + i * 0.08)}
              className="rounded-[20px] p-8 flex flex-col"
              style={{ background: '#F9F5FC' }}
            >
              {/* Illustration container */}
              <div className="w-full h-[180px] flex items-center justify-center mb-5">
                <LazyImage
                  src={b.img}
                  webpSrc={b.webp}
                  alt={b.alt}
                  className={b.large ? "max-h-[200px] max-w-[260px] w-auto h-auto object-contain" : "max-h-[160px] max-w-[220px] w-auto h-auto object-contain"}
                  containerClassName={b.large ? "h-[200px] max-w-[260px] flex items-center justify-center" : "h-[160px] max-w-[220px] flex items-center justify-center"}
                />
              </div>

              {/* Title */}
              <h3
                className="text-[22px] md:text-[24px] font-medium text-[#0A0B24] mb-2 tracking-[-0.02em]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {b.title}
              </h3>

              {/* Description */}
              <p
                className="text-[14px] text-[#4A4A68] leading-[1.6]"
                style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
              >
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div {...fadeUp(20, 0.7)} className="mt-12 flex flex-col items-center gap-4">
          <p
            className="text-white text-[16px] font-bold text-center"
            style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
          >
            Incluso no plano Founder — R$ 899,90/semestre
          </p>
          <button
            onClick={handleApply}
            className="text-white font-bold text-[16px] md:text-[18px] px-8 py-4 rounded-xl transition-colors duration-200"
            style={{
              background: '#F97316',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E5670E')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F97316')}
          >
            Aplicar para a Aceleração →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Aceleracao2Benefits;
