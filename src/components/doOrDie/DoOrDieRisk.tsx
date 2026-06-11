import { Shield, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DoOrDieRisk = () => {
  return (
    <section className="px-4 py-12 sm:py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="hidden sm:block absolute top-10 left-10 text-primary/20 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="hidden sm:block absolute bottom-10 right-10 text-accent/20 animate-pulse delay-300">
        <Zap className="w-8 h-8" />
      </div>
      
      <div className="max-w-3xl mx-auto text-center relative z-10 px-2">
        {/* Icon */}
        <div className="inline-flex p-3 sm:p-4 bg-accent/10 rounded-full mb-6 sm:mb-8 glow-accent">
          <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-accent" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
          O Risco é Todo Seu{" "}
          <span className="text-accent">(E isso é bom)</span>
        </h2>
        
        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            A maioria dos programas promete sucesso.{" "}
            <span className="text-foreground font-semibold">Nós prometemos A Verdade.</span>
          </p>
          
          <Card className="glass-card border-accent/30">
            <CardContent className="py-6 px-4 sm:py-8 sm:px-6">
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient italic">
                "A verdade pode doer, mas ela liberta."
              </blockquote>
            </CardContent>
          </Card>
          
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Ao final de 15 dias, você não terá mais dúvidas.{" "}
            <span className="text-foreground font-semibold">
              Você terá um negócio ou uma lição.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default DoOrDieRisk;
