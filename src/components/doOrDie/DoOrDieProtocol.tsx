import { Scissors, Hammer, Rocket, Scale, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/scroll-animations";

interface Phase {
  days: string;
  title: string;
  subtitle: string;
  description: string;
  tasks: string[];
  deliverable: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const phases: Phase[] = [
  {
    days: "D1-3",
    title: "O Corte",
    subtitle: "Mate suas ideias ruins",
    description: "Descubra rápido se sua ideia tem potencial ou é ilusão.",
    tasks: [
      "Análise de mercado em 2h",
      "10 conversas com clientes",
      "Decisão: pivotar ou matar",
    ],
    deliverable: "Nota de Validação",
    icon: Scissors,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
  {
    days: "D4-7",
    title: "A Construção",
    subtitle: "O MVP feio que funciona",
    description: "Construa a versão mais simples que resolve o problema.",
    tasks: [
      "Definição da feature central",
      "Construção em modo turbo",
      "Zero perfeccionismo, só função",
    ],
    deliverable: "MVP Funcional",
    icon: Hammer,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    days: "D8-13",
    title: "A Ofensiva",
    subtitle: "Vá vender de verdade",
    description: "Lance, venda e colete feedback real em tempo recorde.",
    tasks: [
      "Lançamento para early users",
      "Primeiras vendas de verdade",
      "Coleta de feedback brutal",
    ],
    deliverable: "Primeira Receita",
    icon: Rocket,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    days: "D15",
    title: "O Veredito",
    subtitle: "A hora da verdade",
    description: "Apresente resultados e receba o veredito dos mentores.",
    tasks: [
      "Pitch com métricas reais",
      "Banca de avaliação final",
      "Feedback direto e honesto",
    ],
    deliverable: "Decisão Final",
    icon: Scale,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
];

const DoOrDieProtocol = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          {...fadeUp(20, 0)}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              Metodologia
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            O Protocolo <span className="text-accent">BuildUP</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4 fases intensivas para ir de ideia a negócio validado.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line - Mobile */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-destructive via-amber-500 via-orange-500 to-emerald-500" />
          
          {/* Horizontal Line - Desktop */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-destructive via-amber-500 via-orange-500 to-emerald-500" />

          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.title}
                {...fadeUp(25, index * 0.12)}
                className="relative pl-14 md:pl-0 flex"
              >
                {/* Mobile Timeline Dot */}
                <div className={`md:hidden absolute left-4 top-0 w-5 h-5 rounded-full ${phase.bgColor} border-2 ${phase.borderColor} -translate-x-1/2`} />

                <Card className={`glass-card ${phase.borderColor} hover:scale-[1.02] transition-all duration-300 h-full flex-1`}>
                  <CardContent className="p-5 md:p-6 flex flex-col h-full">
                    {/* Desktop Timeline Dot */}
                    <div className={`hidden md:flex w-10 h-10 rounded-full ${phase.bgColor} border-2 ${phase.borderColor} items-center justify-center mx-auto -mt-11 mb-4 bg-background`}>
                      <phase.icon className={`w-5 h-5 ${phase.color}`} />
                    </div>

                    {/* Days Badge */}
                    <Badge className={`${phase.bgColor} ${phase.color} border-0 mb-3`}>
                      {phase.days}
                    </Badge>

                    {/* Title */}
                    <h3 className={`text-xl font-bold ${phase.color} mb-1`}>
                      {phase.title}
                    </h3>
                    <p className="text-[13px] md:text-[16px] text-muted-foreground mb-3">
                      {phase.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-[12px] md:text-[14px] text-muted-foreground mb-4 line-clamp-2">
                      {phase.description}
                    </p>

                    {/* Tasks */}
                    <ul className="space-y-2 mb-4 flex-1">
                      {phase.tasks.map((task) => (
                        <li key={task} className="flex items-start gap-2 text-[12px] md:text-[14px]">
                          <Check className={`w-4 h-4 ${phase.color} shrink-0 mt-0.5`} />
                          <span className="text-foreground/80">{task}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Deliverable */}
                    <div className={`p-3 rounded-lg ${phase.bgColor} border ${phase.borderColor} mt-auto`}>
                      <p className="text-[11px] md:text-[12px] text-muted-foreground mb-1">Entregável:</p>
                      <p className={`text-[12px] md:text-[14px] font-semibold ${phase.color}`}>{phase.deliverable}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoOrDieProtocol;
