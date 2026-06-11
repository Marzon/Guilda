import { motion } from "framer-motion";
import { Terminal, Lightbulb, Bot, CheckCircle, Zap, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp, fadeRotate, fadeIn } from "@/lib/scroll-animations";

const agents = [
  {
    nameKey: "commander",
    name: "Guilda Commander",
    role: "O Sócio Sênior Impaciente",
    roleEn: "The Impatient Senior Partner",
    roleEs: "El Socio Senior Impaciente",
    description: "Seu mentor de IA que avalia cada entrega como um investidor exigente. Feedback brutal, sem rodeios.",
    descriptionEn: "Your AI mentor that evaluates each delivery like a demanding investor. Brutal feedback, no beating around the bush.",
    descriptionEs: "Tu mentor de IA que evalúa cada entrega como un inversor exigente. Feedback brutal, sin rodeos.",
    features: [
      { pt: "Avalia cada entrega diária", en: "Evaluates each daily delivery", es: "Evalúa cada entrega diaria", ptShort: "Avalia cada entrega", enShort: "Evaluates deliveries", esShort: "Evalúa entregas" },
      { pt: "Feedback direto e acionável", en: "Direct and actionable feedback", es: "Feedback directo y accionable", ptShort: "Feedback direto", enShort: "Direct feedback", esShort: "Feedback directo" },
      { pt: "Aprova ou bloqueia avanço", en: "Approves or blocks progress", es: "Aprueba o bloquea el avance", ptShort: "Aprova ou bloqueia", enShort: "Approves or blocks", esShort: "Aprueba o bloquea" },
      { pt: "Detecta armadilhas de founder", en: "Detects founder traps", es: "Detecta trampas de founder", ptShort: "Detecta armadilhas", enShort: "Detects traps", esShort: "Detecta trampas" },
    ],
    timing: "Ativo: Dias 1-15",
    timingEn: "Active: Days 1-15",
    timingEs: "Activo: Días 1-15",
    icon: Terminal,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-500/30",
    axiom: "Ação > Intenção",
    axiomFull: "Só importa o que foi feito e PROVADO.",
    axiomFullEn: "Only what was done and PROVEN matters.",
    axiomFullEs: "Solo importa lo que fue hecho y PROBADO.",
  },
  {
    nameKey: "pivoter",
    name: "Guilda Pivoter",
    role: "O Pivot Architect",
    roleEn: "The Pivot Architect",
    roleEs: "El Arquitecto de Pivots",
    description: "Estrategista de produto que analisa sua trajetória e sugere mudanças radicais para escalar.",
    descriptionEn: "Product strategist that analyzes your trajectory and suggests radical changes to scale.",
    descriptionEs: "Estratega de producto que analiza tu trayectoria y sugiere cambios radicales para escalar.",
    features: [
      { pt: "Analisa toda sua jornada", en: "Analyzes your entire journey", es: "Analiza todo tu recorrido", ptShort: "Analisa sua jornada", enShort: "Analyzes journey", esShort: "Analiza recorrido" },
      { pt: "Sugere otimizações rápidas", en: "Suggests quick optimizations", es: "Sugiere optimizaciones rápidas", ptShort: "Sugere otimizações", enShort: "Suggests optimizations", esShort: "Sugiere optimizaciones" },
      { pt: "Gera 7 ideias de pivot", en: "Generates 7 pivot ideas", es: "Genera 7 ideas de pivot", ptShort: "Gera ideias de pivot", enShort: "Generates pivot ideas", esShort: "Genera ideas de pivot" },
      { pt: "Plano de MVP em 7 dias", en: "MVP plan in 7 days", es: "Plan de MVP en 7 días", ptShort: "Plano de MVP rápido", enShort: "Quick MVP plan", esShort: "Plan de MVP rápido" },
    ],
    timing: "Ativo: Após O Veredito",
    timingEn: "Active: After The Verdict",
    timingEs: "Activo: Después del Veredicto",
    icon: Lightbulb,
    gradient: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-500/10 to-violet-500/5",
    borderColor: "border-purple-500/30",
    axiom: "Dados > Opinião",
    axiomFull: "Pivot baseado em evidências, não em achismo.",
    axiomFullEn: "Pivot based on evidence, not guesswork.",
    axiomFullEs: "Pivot basado en evidencias, no en suposiciones.",
  },
];

const DoOrDieAgents = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const getLocalizedText = (item: { pt: string; en: string; es: string; ptShort?: string; enShort?: string; esShort?: string }, short = false) => {
    if (short) {
      if (lang.startsWith('en')) return item.enShort || item.en;
      if (lang.startsWith('es')) return item.esShort || item.es;
      return item.ptShort || item.pt;
    }
    if (lang.startsWith('en')) return item.en;
    if (lang.startsWith('es')) return item.es;
    return item.pt;
  };

  const getAgentRole = (agent: typeof agents[0]) => {
    if (lang.startsWith('en')) return agent.roleEn;
    if (lang.startsWith('es')) return agent.roleEs;
    return agent.role;
  };

  const getAgentDescription = (agent: typeof agents[0]) => {
    if (lang.startsWith('en')) return agent.descriptionEn;
    if (lang.startsWith('es')) return agent.descriptionEs;
    return agent.description;
  };

  const getAgentTiming = (agent: typeof agents[0]) => {
    if (lang.startsWith('en')) return agent.timingEn;
    if (lang.startsWith('es')) return agent.timingEs;
    return agent.timing;
  };

  const getAxiomFull = (agent: typeof agents[0]) => {
    if (lang.startsWith('en')) return agent.axiomFullEn;
    if (lang.startsWith('es')) return agent.axiomFullEs;
    return agent.axiomFull;
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          {...fadeUp(20, 0)}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t('doOrDie.agents.badge', 'Mentoria Inteligente')}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('doOrDie.agents.title', 'Seus Mentores de IA')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('doOrDie.agents.subtitle', 'Dois agentes especializados trabalhando 24/7 para garantir que você não desperdice tempo com mediocridade.')}
          </p>
        </motion.div>

        {/* Agents Grid - with rotation landing effect */}
        <div className="flex flex-row sm:grid sm:grid-cols-2 gap-2.5 sm:gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.nameKey}
              className="flex-1 min-w-0"
              {...fadeRotate(index === 0 ? -20 : 20, index === 0 ? -2 : 2, 0.15 + index * 0.15)}
            >
              <Card className={`h-full bg-gradient-to-br ${agent.bgGradient} border ${agent.borderColor} hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-3.5 sm:p-6 md:p-8">
                  {/* Agent Header */}
                  <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-2 sm:gap-4 mb-3 sm:mb-6">
                    <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <agent.icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[14px] sm:text-xl font-bold text-foreground">{agent.name}</h3>
                      <p className="text-[11px] sm:text-sm font-medium text-[#7610DC]">
                        {getAgentRole(agent)}
                      </p>
                    </div>
                  </div>

                  {/* Mobile bullets */}
                  <ul className="sm:hidden space-y-1 mb-3">
                    {agent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-foreground text-left">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: index === 0 ? '#f59e0b' : '#8b5cf6' }} />
                        <span className="text-[11px] leading-[1.3]">{getLocalizedText(feature, true)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop full content */}
                  <p className="hidden sm:block text-muted-foreground mb-6 leading-relaxed">
                    {getAgentDescription(agent)}
                  </p>
                  <ul className="hidden sm:block space-y-3 mb-6">
                    {agent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-foreground">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: index === 0 ? '#f59e0b' : '#8b5cf6' }} />
                        <span className="text-sm">{getLocalizedText(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`hidden sm:block p-4 rounded-xl bg-background/50 border ${agent.borderColor} mb-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-muted-foreground" />
                      <span className={`text-sm font-bold bg-gradient-to-r ${agent.gradient} bg-clip-text text-transparent`}>
                        {agent.axiom}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{getAxiomFull(agent)}"
                    </p>
                  </div>

                  {/* Timing Badge */}
                  <div className="flex justify-center sm:justify-start">
                    <Badge className={`bg-gradient-to-r ${agent.gradient} text-white border-0 text-[10px] sm:text-xs`}>
                      <Zap className="w-3 h-3 mr-1" />
                      {getAgentTiming(agent)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          className="text-center text-muted-foreground mt-12 max-w-xl mx-auto"
          {...fadeIn(0.4)}
        >
          {t('doOrDie.agents.note', 'Enquanto outros programas dependem de mentores humanos com agenda limitada, você tem acesso ilimitado aos nossos agentes de IA.')}
        </motion.p>
      </div>
    </section>
  );
};

export default DoOrDieAgents;
