import * as React from "react";
import { useTranslation } from "react-i18next";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import avatarStela from "@/assets/testimonials/stela.png";
import avatarFernando from "@/assets/testimonials/fernando.jpg";
import avatarBruno from "@/assets/testimonials/bruno_souto_oliveira.jpg";
import avatarMatheus from "@/assets/testimonials/matheus.png";
import avatarRondinelly from "@/assets/testimonials/rondinelly_santos.jpg";
import avatarRenan from "@/assets/testimonials/renanmanao.png";
import avatarPablo from "@/assets/testimonials/pablo_rodnitzky.jpg";
import avatarNeivam from "@/assets/testimonials/neivam_carvalho.jpg";
import avatarMarzon from "@/assets/testimonials/marzon.png";

interface TestimonialData {
  id: string;
  quote: string;
  username: string;
  avatar_url: string | null;
  archetype: "BUILDER" | "SELLER" | null;
  role: string;
  is_featured: boolean;
}

const STATIC_TESTIMONIALS: TestimonialData[] = [
  { id: "1", quote: "Economizei mais de 10h por semana buscando um co-founder. Com a Guilda, em minutos, me conectei com pessoas qualificadas. Encontrei meu CTO e agora estamos nos próximos passos pra crescer nossa base.", username: "stela", avatar_url: avatarStela, archetype: "SELLER", role: "Seller · Growth", is_featured: true },
  { id: "2", quote: "Ao ser membro da Guilda, consegui ser co-founder de um projeto, validei duas ideias que pareciam promissoras e não eram, economizando R$50.000 e 3 meses de tempo. Me sinto pronto e motivado a iniciar um novo negócio.", username: "fernando", avatar_url: avatarFernando, archetype: "BUILDER", role: "Builder · Dev Full-Stack", is_featured: true },
  { id: "3", quote: "Encontrei um sócio em menos de uma semana depois de meses procurando. Agora tenho um sócio tech que me complementa. A IA que relaciona os perfis é o diferencial.", username: "bruno_souto_oliveira", avatar_url: avatarBruno, archetype: "SELLER", role: "Seller · Negócios", is_featured: true },
  { id: "4", quote: "Já conquistei um novo cliente, elevando minha base para 6 pagantes. Sei exatamente onde meu negócio está e quais são os próximos passos. A Guilda é o atalho para quem busca clareza estratégica.", username: "Matheus", avatar_url: avatarMatheus, archetype: "BUILDER", role: "Builder · Produto", is_featured: false },
  { id: "5", quote: "Economizei 6 meses com um projeto de 15 dias. Percebi que estava insistindo num caminho errado. Através dos exercícios e mentoria, voltei à prancheta com muito mais clareza.", username: "rondinelly_santos", avatar_url: avatarRondinelly, archetype: "BUILDER", role: "Builder · Dev", is_featured: false },
  { id: "6", quote: "Fiz grandes contatos em menos de uma semana. Entrei para validar uma ideia, fiz conexão com outro founder e estamos estudando possibilidades juntos. Se você busca crescimento acelerado, não conheço outro lugar.", username: "renanmanao", avatar_url: avatarRenan, archetype: "SELLER", role: "Seller · Growth", is_featured: false },
  { id: "7", quote: "A Guilda conecta empreendedores e devs de forma simples e fácil. Fiz contato com vários devs. Diria para não perder tempo e usar a Guilda.", username: "pablo_rodnitzky", avatar_url: avatarPablo, archetype: "SELLER", role: "Seller · Vendas", is_featured: false },
  { id: "8", quote: "Economizei pelo menos 2 meses de trabalho validando a ideia conversando com possíveis clientes. Me sinto com mais visão do topo e abertura de novas ideias. A rede de contatos permanece.", username: "neivam_carvalho", avatar_url: avatarMarzon, archetype: "SELLER", role: "Seller · Vendas", is_featured: false },
  { id: "9", quote: "Linkedin voltado a founders. Direto, rápido, sem disneyland. Volto aqui todos os dias. Melhorou muito o dia a dia.", username: "Marzon Castilho", avatar_url: avatarNeivam, archetype: "BUILDER", role: "Builder · Produto", is_featured: false },
];

interface TestimonialsCarouselProps {
  page?: string;
  limit?: number;
  showFeaturedOnly?: boolean;
}

export function TestimonialsCarousel({ limit = 9, showFeaturedOnly = false }: TestimonialsCarouselProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const testimonials = showFeaturedOnly
    ? STATIC_TESTIMONIALS.filter(t => t.is_featured).slice(0, limit)
    : STATIC_TESTIMONIALS.slice(0, limit);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section className="py-12 sm:py-32 bg-white border-t border-black/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative flex flex-col items-center">
        <div className="relative w-full max-w-[700px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl lg:rounded-[2rem] p-6 sm:p-8 border border-black/10"
            >
              <span className="block text-[48px] leading-none text-[#F97316] select-none -mb-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{"\u201C"}</span>
              <p className="text-base sm:text-lg text-black italic leading-[1.6]">
                {current.quote}
              </p>
              <div className="w-10 h-px bg-gray-200 my-5" />
              <div className="flex items-center gap-3">
                <SmartAvatar
                  avatarUrl={current.avatar_url}
                  name={current.username}
                  archetype={current.archetype}
                  size="md"
                  className="w-12 h-12 ring-2 ring-gray-100 flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-sm text-black">@{current.username}</p>
                  <p className="text-sm text-gray-500">{current.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="w-10 h-10 rounded-full border border-black/10 hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-1.5">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-[#7610DC] w-4' : 'bg-gray-300 w-1.5'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Depoimento ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
            className="w-10 h-10 rounded-full border border-black/10 hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
