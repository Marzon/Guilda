import { Users, Code, Rocket, CheckCircle2, Crown, Terminal, Lightbulb, MessageSquare, Zap, Gift, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { fadeUp, fadeScale, fadeIn } from "@/lib/scroll-animations";

const APP_URL = 'https://suprema.guilda.app.br';

const steps = [
  {
    number: "01",
    title: "Match",
    days: "Dias 1-3",
    description: "Forme sua dupla Builder + Seller com base em compatibilidade real, não achismo.",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  {
    number: "02",
    title: "Build",
    days: "Dias 4-10",
    description: "Construa o MVP mais feio e funcional possível. Sem perfeccionismo, só execução.",
    icon: Code,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
  },
  {
    number: "03",
    title: "Launch",
    days: "Dias 11-15",
    description: "Vá ao mercado, venda de verdade, e valide com dinheiro no bolso.",
    icon: Rocket,
    color: "text-seller",
    bgColor: "bg-seller/10",
    borderColor: "border-seller/30",
  },
];

const benefits = [
  {
    icon: Users,
    title: "Match Builder + Seller",
    description: "Dupla complementar formada por compatibilidade real de portfólio.",
  },
  {
    icon: Terminal,
    title: "Commander IA (mentor 24/7)",
    description: "Seu sócio sênior impaciente que avalia cada entrega e bloqueia mediocridade.",
  },
  {
    icon: Lightbulb,
    title: "Pivoter IA (7 ideias de pivot)",
    description: "Analisa sua jornada e gera ideias de pivot com plano de execução.",
  },
  {
    icon: MessageSquare,
    title: "Comunidade exclusiva",
    description: "Grupo WhatsApp com founders do seu cohort para networking e suporte.",
  },
  {
    icon: Zap,
    title: "Missões diárias com feedback",
    description: "Entregas diárias avaliadas por IA com feedback brutal e acionável.",
  },
  {
    icon: Gift,
    title: "6 meses Founder (acesso premium)",
    description: "Acesso completo à plataforma Guilda com todas as ferramentas premium.",
  },
];

const DoOrDieSolution = () => {
  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/aceleracao/inscrever');
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          {...fadeUp(20, 0)}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              A Solução
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Como Funciona a <span className="text-primary">Aceleração</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            15 dias de execução brutal focada em uma única métrica: primeira receita.
          </p>
        </motion.div>

        {/* Timeline Steps - stagger */}
        <div className="relative mb-16">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-seller transform -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                {...fadeUp(30, 0.1 + index * 0.15)}
              >
                <Card className={`glass-card ${step.borderColor} hover:scale-[1.02] transition-all duration-300 h-full`}>
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mx-auto mb-4 border-2 ${step.borderColor}`}>
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${step.bgColor} ${step.color} mb-3`}>
                      {step.days}
                    </span>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Intermediate CTA */}
        <motion.div
          className="text-center mb-20"
          {...fadeIn(0.5)}
        >
          <p className="text-xl font-bold text-foreground mb-4">
            Você tem 15 dias. O mercado não espera.
          </p>
          <Button
            onClick={handleApply}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold text-base px-8 py-3 h-auto rounded-xl uppercase tracking-wide group"
          >
            Inscrever-se Agora
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Benefits Grid - "O que você recebe" */}
        <div>
          <motion.div {...fadeUp(20, 0)}>
            <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">
              O que você recebe
            </h3>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              Tudo que você precisa para sair da ideia e chegar na primeira receita.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                {...fadeScale(0.9, 0.1 + index * 0.08)}
                className="flex flex-col items-center text-center p-3.5 sm:p-6 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-4">
                  <benefit.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h4 className="font-bold text-[13px] sm:text-base text-foreground mb-1 sm:mb-2">{benefit.title}</h4>
                <p className="text-[11px] leading-[1.3] sm:text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Pricing note under benefits */}
          <motion.div className="mt-8 text-center" {...fadeIn(0.6)}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-foreground">Incluso no plano Founder — R$ 899,90/semestre</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DoOrDieSolution;
