import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useCohorts } from "@/hooks/useCohorts";
import { motion, AnimatePresence } from "framer-motion";
import { buildCoreAppUrl } from "@/lib/url-utils";

const APP_URL = 'https://suprema.guilda.app.br';

const DoOrDieStickyBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { openCohorts } = useCohorts();
  
  const activeCohort = openCohorts?.[0];
  const enrolledCount = activeCohort?.members_count || 0;
  const maxSlots = activeCohort?.max_slots || 30;
  const remainingSlots = maxSlots - enrolledCount;

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.9;
      setIsVisible(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/aceleracao/inscrever');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-border"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {remainingSlots <= 10 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Apenas {remainingSlots} vagas restantes
                  </span>
                </div>
              )}
              {activeCohort && (
                <span className="hidden sm:block text-sm text-muted-foreground">
                  Próximo cohort: {new Date(activeCohort.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>

            <Button
              onClick={handleClick}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold group uppercase tracking-wide"
            >
              Inscrever-se Agora
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoOrDieStickyBar;
