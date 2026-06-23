import { motion } from "framer-motion";

const STORAGE_BASE = `https://api.guilda.app.br/storage/v1/object/public/quiz-reports`;

const ARCHETYPE_DATA: Record<string, { name: string; image: string; emoji: string }> = {
  mago: { name: "Mago do Código", image: "og-mago.png", emoji: "🧙‍♂️" },
  arquiteto: { name: "Arquiteto Visionário", image: "og-arquiteto.png", emoji: "🏗️" },
  paladino: { name: "Paladino de Vendas", image: "og-paladino.png", emoji: "⚔️" },
  estrategista: { name: "Estrategista Arcano", image: "og-estrategista.png", emoji: "🔮" },
  ranger: { name: "Ranger Híbrido", image: "og-ranger.png", emoji: "🏹" },
  comandante: { name: "Comandante da Guilda", image: "og-comandante.png", emoji: "👑" },
};

interface QuizResultadoLandingProps {
  archetypeKey: string;
  onStart: () => void;
}

export function QuizResultadoLanding({ archetypeKey, onStart }: QuizResultadoLandingProps) {
  const data = ARCHETYPE_DATA[archetypeKey] || ARCHETYPE_DATA.mago;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 md:px-6"
    >
      <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#7610DC]/20 text-[#A728EB] border border-[#7610DC]/30">
        Resultado compartilhado
      </span>

      <p className="text-[#B8A5D0] text-sm mb-4">
        Alguém que você conhece é um...
      </p>

      <img
        src={`${STORAGE_BASE}/${data.image}`}
        alt={data.name}
        className="w-64 h-64 rounded-2xl object-cover mb-6 border-2 border-[#7610DC]/30"
      />

      <h1 className="text-[28px] md:text-[32px] font-bold text-white leading-tight max-w-[480px] mb-6">
        E você? Qual é o seu arquétipo?
      </h1>

      <p className="text-[#B8A5D0] text-base max-w-[440px] mb-8 leading-relaxed">
        Descubra em 2 minutos que tipo de fundador você é e qual perfil
        complementar de co-founder você precisa.
      </p>

      <button
        onClick={onStart}
        className="bg-[#F97316] hover:bg-[#EA680C] text-white font-bold text-base rounded-xl px-10 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Descobrir Meu Arquétipo →
      </button>

      <p className="text-[#6B5B80] text-xs mt-4">
        Sem cadastro. 10 perguntas. ~2 minutos.
      </p>
    </motion.div>
  );
}
