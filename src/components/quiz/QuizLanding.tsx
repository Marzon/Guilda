import { motion } from "framer-motion";

interface QuizLandingProps {
  onStart: () => void;
}

const ARCHETYPE_EMOJIS = ["🧙‍♂️", "⚔️", "🏗️", "🔮", "🏹", "👑"];

export function QuizLanding({ onStart }: QuizLandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 md:px-6"
    >
      <span className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#7610DC]/20 text-[#A728EB] border border-[#7610DC]/30">
        Quiz Gratuito
      </span>

      <h1 className="text-[32px] md:text-[36px] font-bold text-white leading-tight max-w-[480px] mb-4">
        Qual é o Seu Perfil de Empreendedor?
      </h1>

      <p className="text-[#B8A5D0] text-base max-w-[440px] mb-8 leading-relaxed">
        Descubra em 2 minutos que tipo de fundador você é e qual perfil
        complementar de co-founder você precisa para fazer sua startup decolar.
      </p>

      <button
        onClick={onStart}
        className="bg-[#F97316] hover:bg-[#EA680C] text-white font-bold text-base rounded-xl px-10 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Começar o Quiz →
      </button>

      <p className="text-[#6B5B80] text-xs mt-4">
        Sem cadastro. 10 perguntas. ~2 minutos.
      </p>

      <div className="flex gap-3 mt-8">
        {ARCHETYPE_EMOJIS.map((emoji, i) => (
          <span key={i} className="text-2xl grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 md:grayscale md:opacity-40 md:hover:grayscale-0 md:hover:opacity-100 max-md:grayscale-0 max-md:opacity-100">
            {emoji}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
