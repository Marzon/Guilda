import { Code, Briefcase, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { fadeUp, fadeX, fadeIn } from "@/lib/scroll-animations";

const APP_URL = 'https://suprema.guilda.app.br';

const builderBenefits = [
  { full: "Você tem skills técnicas sólidas", short: "Skills técnicas sólidas" },
  { full: "Quer equity em vez de salário", short: "Quer equity, não salário" },
  { full: "Busca um sócio de negócios", short: "Busca sócio de negócios" },
  { full: "Está cansado de projetos que não vendem", short: "Cansado de não vender" },
];

const sellerBenefits = [
  { full: "Você sabe vender e negociar", short: "Sabe vender e negociar" },
  { full: "Tem visão de mercado aguçada", short: "Visão de mercado aguçada" },
  { full: "Busca um sócio técnico", short: "Busca sócio técnico" },
  { full: "Está cansado de depender de terceiros", short: "Cansado de depender" },
];

const exclusions = [
  "Quer só \"dar uma olhada\" sem compromisso",
  "Não tem 2h/dia para dedicar ao programa",
  "Acredita que sua ideia é perfeita demais para validar",
  "Não está disposto a ouvir feedback duro",
];

const DoOrDieAudience = () => {
  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/aceleracao/inscrever');
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          {...fadeUp(20, 0)}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Para Quem é Este <span className="text-primary">Programa</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A aceleração funciona para dois perfis complementares que querem construir juntos.
          </p>
        </motion.div>

        {/* Split Screen - Builder vs Seller */}
        <div className="flex flex-row gap-2.5 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-0 mb-16 sm:rounded-3xl sm:overflow-hidden sm:border sm:border-border">
          {/* Builder Side */}
          <motion.div
            {...fadeX(-30, 0.15)}
            className="flex-1 min-w-0 rounded-xl sm:rounded-none bg-gradient-to-br from-builder/10 to-builder/5 p-3.5 sm:p-8 md:p-12 sm:border-b lg:border-b-0 lg:border-r border-border"
          >
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 mb-3 sm:mb-6">
              <div className="w-7 h-7 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-builder/20 flex items-center justify-center flex-shrink-0">
                <Code className="w-3.5 h-3.5 sm:w-7 sm:h-7 text-builder" />
              </div>
              <div>
                <h3 className="text-[14px] sm:text-2xl font-bold text-builder">Builders</h3>
                <p className="text-[10px] sm:text-base text-muted-foreground">Desenvolvedores & CTOs</p>
              </div>
            </div>

            <p className="hidden sm:block text-xl font-semibold text-foreground mb-6">
              Para quem respira código<br />e quer <span className="text-builder">equity</span>.
            </p>

            {/* Mobile bullets */}
            <ul className="sm:hidden space-y-1 mb-3">
              {builderBenefits.map((b) => (
                <li key={b.short} className="flex items-start gap-2 text-left">
                  <Check className="w-3 h-3 text-builder shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-[1.3] text-foreground">{b.short}</span>
                </li>
              ))}
            </ul>

            {/* Desktop bullets */}
            <ul className="hidden sm:block space-y-3 mb-8">
              {builderBenefits.map((b) => (
                <li key={b.full} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-builder shrink-0 mt-0.5" />
                  <span className="text-foreground">{b.full}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleApply}
              className="hidden sm:flex w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold group uppercase tracking-wide"
            >
              Sou Builder — Quero Inscrever
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Seller Side */}
          <motion.div
            {...fadeX(30, 0.25)}
            className="flex-1 min-w-0 rounded-xl sm:rounded-none bg-gradient-to-br from-seller/10 to-seller/5 p-3.5 sm:p-8 md:p-12"
          >
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 mb-3 sm:mb-6">
              <div className="w-7 h-7 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-seller/20 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-3.5 h-3.5 sm:w-7 sm:h-7 text-seller" />
              </div>
              <div>
                <h3 className="text-[14px] sm:text-2xl font-bold text-seller">Sellers</h3>
                <p className="text-[10px] sm:text-base text-muted-foreground">Negócios & CEOs</p>
              </div>
            </div>

            <p className="hidden sm:block text-xl font-semibold text-foreground mb-6">
              Para quem respira negócios<br />e quer <span className="text-seller">produto</span>.
            </p>

            {/* Mobile bullets */}
            <ul className="sm:hidden space-y-1 mb-3">
              {sellerBenefits.map((b) => (
                <li key={b.short} className="flex items-start gap-2 text-left">
                  <Check className="w-3 h-3 text-seller shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-[1.3] text-foreground">{b.short}</span>
                </li>
              ))}
            </ul>

            {/* Desktop bullets */}
            <ul className="hidden sm:block space-y-3 mb-8">
              {sellerBenefits.map((b) => (
                <li key={b.full} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-seller shrink-0 mt-0.5" />
                  <span className="text-foreground">{b.full}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleApply}
              className="hidden sm:flex w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold group uppercase tracking-wide"
            >
              Sou Seller — Quero Inscrever
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* Exclusions */}
        <motion.div {...fadeIn(0.4)}>
          <Card className="glass-card border-destructive/20 max-w-3xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <h4 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                <X className="w-5 h-5" />
                Este programa NÃO é para você se...
              </h4>
              <ul className="grid sm:grid-cols-2 gap-3">
                {exclusions.map((exclusion) => (
                  <li key={exclusion} className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 shrink-0" />
                    {exclusion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default DoOrDieAudience;
