import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/data/quizData";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  total: number;
  onSelect: (optionIndex: number) => void;
  onBack: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

export function QuizQuestion({ question, questionIndex, total, onSelect, onBack }: QuizQuestionProps) {
  const progress = ((questionIndex + 1) / total) * 100;

  return (
    <div className="w-full px-4 md:px-6">
      {/* Back button + Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBack}
            className="text-[#8B7BA0] hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
          >
            ← Voltar
          </button>
          <span className="text-[#8B7BA0] text-sm font-medium">
            {questionIndex + 1}/{total}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#2A1F3D] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-400 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7610DC, #A728EB)",
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-[20px] md:text-[22px] font-bold text-white mb-6 leading-snug">
            {question.text}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className="group flex items-start gap-3.5 p-4 rounded-[14px] border-2 border-transparent bg-[#1A1230] hover:border-[#7610DC66] transition-all duration-200 active:scale-[0.98] text-left min-h-[44px]"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2A1F3D] text-[#8B7BA0] flex items-center justify-center text-sm font-bold group-hover:bg-[#7610DC] group-hover:text-white transition-colors">
                  {LETTERS[i]}
                </span>
                <span className="text-[#C4B5D9] text-[15px] leading-snug group-hover:text-white transition-colors min-w-0 flex-1">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
