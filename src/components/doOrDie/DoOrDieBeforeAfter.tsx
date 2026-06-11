import { ArrowRight, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, fadeX, fadeScale } from "@/lib/scroll-animations";

const beforeItems = [
  { full: "6 meses 'desenvolvendo' sem lançar", short: "6 meses sem lançar" },
  { full: "Procurando sócio no LinkedIn sem sucesso", short: "Sócio? LinkedIn sem sucesso" },
  { full: "MVP perfeito que ninguém usa", short: "MVP que ninguém usa" },
  { full: "Zero receita, muita esperança", short: "Zero receita" },
];

const afterItems = [
  { full: "MVP funcional no ar em 7 dias", short: "MVP no ar em 7 dias" },
  { full: "Match com co-founder compatível", short: "Co-founder compatível" },
  { full: "Feedback real de clientes pagantes", short: "Clientes pagando" },
  { full: "Decisão clara: escalar ou pivotar", short: "Escalar ou pivotar" },
];

const DoOrDieBeforeAfter = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-14"
          {...fadeUp(20, 0)}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Antes <span className="text-muted-foreground mx-2">vs</span> <span className="text-primary italic">Depois</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            O que muda quando você entra no protocolo BuildUP.
          </p>
        </motion.div>

        <div className="flex flex-row gap-2.5 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 md:gap-8 relative">
          {/* Before */}
          <motion.div
            className="flex-1 min-w-0 border-l-[3px] border-l-destructive sm:border-l-0 rounded-xl sm:rounded-2xl bg-destructive/5 border border-destructive/20 p-3.5 sm:p-8 md:p-10"
            {...fadeX(-30, 0.15)}
          >
            <h3 className="text-[13px] sm:text-xl font-bold text-destructive mb-2 sm:mb-6 uppercase tracking-wider">
              Antes
            </h3>
            {/* Mobile bullets */}
            <ul className="sm:hidden space-y-1.5">
              {beforeItems.map((item) => (
                <li key={item.short} className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] leading-[1.4] text-foreground/80">{item.short}</span>
                </li>
              ))}
            </ul>
            {/* Desktop bullets */}
            <ul className="hidden sm:block space-y-4">
              {beforeItems.map((item) => (
                <li key={item.full} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item.full}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Arrow connector - desktop */}
          <motion.div
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            {...fadeScale(0.5, 0.4, 0.5)}
          >
            <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            className="flex-1 min-w-0 border-l-[3px] border-l-primary sm:border-l-0 rounded-xl sm:rounded-2xl bg-primary/5 border border-primary/20 p-3.5 sm:p-8 md:p-10"
            {...fadeX(30, 0.25)}
          >
            <h3 className="text-[13px] sm:text-xl font-bold text-primary mb-2 sm:mb-6 uppercase tracking-wider">
              Depois de 15 dias
            </h3>
            {/* Mobile bullets */}
            <ul className="sm:hidden space-y-1.5">
              {afterItems.map((item) => (
                <li key={item.short} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] leading-[1.4] text-foreground/80">{item.short}</span>
                </li>
              ))}
            </ul>
            {/* Desktop bullets */}
            <ul className="hidden sm:block space-y-4">
              {afterItems.map((item) => (
                <li key={item.full} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item.full}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DoOrDieBeforeAfter;
