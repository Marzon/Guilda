import { Code2, TrendingUp, Landmark } from "lucide-react";
import matchSwordsIcon from "@/assets/match-swords-icon.png";

export const MatchCards = () => {
  return (
    <div className="relative mt-8 lg:mt-0 flex items-center justify-center px-2 sm:px-6 w-full max-w-full overflow-hidden">
      {/* Container com posicionamento relativo para cards espalhados */}
      <div className="relative w-[280px] h-[340px] xs:w-[320px] xs:h-[380px] sm:w-[450px] sm:h-[420px] transform scale-[0.85] xs:scale-100">
        
        {/* Card Builder (Esquerda, Rotacionado) */}
        <div className="absolute top-0 left-0 w-[180px] xs:w-[200px] sm:w-[220px] z-20 hover:z-40 transition-all duration-300 hover:scale-105 hover:rotate-0 animate-float-mobile sm:animate-float">
          <div className="glass-card card-glow-builder rounded-2xl p-4 sm:p-5 cursor-pointer border-l-4 border-builder shadow-lg transform -rotate-6">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="bg-builder/20 p-2 rounded-lg">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-builder" />
              </div>
              <span className="bg-builder text-white text-xs font-bold px-2 py-1 rounded">Lvl 42</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground font-display">Marcos D.</h3>
            <p className="text-xs sm:text-sm text-builder font-semibold mb-2 sm:mb-3">The Builder (CTO)</p>
            
            {/* Stats RPG */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                  <span>Python / Django</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-builder h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                  <span>React Native</span>
                  <span>80%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-builder/70 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 text-xs">
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">Fintech</span>
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">SaaS</span>
            </div>
          </div>
        </div>

        {/* Card Investor (Centro, Destaque) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[200px] xs:w-[220px] sm:w-[240px] z-30 hover:z-40 transition-all duration-300 hover:scale-110 animate-float-mobile-delayed-1 sm:animate-float-delayed">
          <div className="glass-card card-glow-emerald rounded-2xl p-4 sm:p-5 cursor-pointer border-2 border-emerald-500 shadow-xl ring-2 ring-emerald-500/20">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              </div>
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">Lvl 55</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground font-display">Carlos M.</h3>
            <p className="text-xs sm:text-sm text-emerald-500 font-semibold mb-2 sm:mb-3">The Investor (Angel)</p>
            
            {/* Stats RPG */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                  <span>Deal Flow</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                  <span>Portfolio</span>
                  <span>88%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-emerald-500/70 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 text-xs">
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">Seed</span>
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">B2B</span>
            </div>
          </div>
        </div>

        {/* Ícone de Match Central */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40">
          <img 
            src={matchSwordsIcon} 
            alt="Match" 
            className="w-14 h-14 rounded-full shadow-lg ring-4 ring-white animate-pulse"
          />
        </div>

        {/* Card Seller (Direita/Baixo, Rotacionado) */}
        <div className="absolute bottom-0 right-0 w-[180px] xs:w-[200px] sm:w-[220px] z-20 hover:z-40 transition-all duration-300 hover:scale-105 hover:rotate-0 animate-float-mobile-delayed-2 sm:animate-float">
          <div className="glass-card card-glow-seller rounded-2xl p-4 sm:p-5 cursor-pointer border-l-4 border-accent shadow-lg transform rotate-6">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded">Lvl 38</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground font-display">Júlia S.</h3>
            <p className="text-xs sm:text-sm text-accent font-semibold mb-2 sm:mb-3">The Seller (CEO)</p>
            
            {/* Stats RPG */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                  <span>B2B Sales</span>
                  <span>98%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                  <span>Fundraising</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-accent/70 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 text-xs">
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">Marketing</span>
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">Growth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
