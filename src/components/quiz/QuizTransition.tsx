import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const TEXTS = [
  "Analisando respostas...",
  "Mapeando seu perfil...",
  "Identificando seu arquétipo...",
];

export function QuizTransition() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => Math.min(prev + 1, TEXTS.length - 1));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Spinning circle */}
      <div className="w-16 h-16 rounded-full border-4 border-[#2A1F3D] border-t-[#7610DC] animate-spin" />

      <AnimatePresence mode="wait">
        <motion.p
          key={textIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-[#B8A5D0] text-base font-medium"
        >
          {TEXTS[textIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
