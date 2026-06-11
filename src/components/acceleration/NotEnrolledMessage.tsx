import { Swords, Flame, Target, Scissors, Hammer, Rocket, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

interface NotEnrolledMessageProps {
  wasInPilotBatch?: boolean;
}

const phases = [
  { icon: Scissors, name: "O Corte", days: "D1-3", color: "text-red-400" },
  { icon: Hammer, name: "Construção", days: "D4-7", color: "text-amber-400" },
  { icon: Rocket, name: "Ofensiva", days: "D8-13", color: "text-orange-400" },
  { icon: Scale, name: "Veredito", days: "D15", color: "text-emerald-400" },
];

export const NotEnrolledMessage = ({ wasInPilotBatch = false }: NotEnrolledMessageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 p-8 shadow-sm">
      {/* Background Effects */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-100/50 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-100/50 rounded-full blur-3xl" />
      
      {/* Floating Icons */}
      <Flame className="absolute top-6 left-6 w-5 h-5 text-red-300 animate-pulse" />
      <Target className="absolute top-6 right-6 w-5 h-5 text-amber-300 animate-pulse" />
      <Swords className="absolute bottom-6 left-6 w-5 h-5 text-orange-300 animate-pulse" />

      <div className="relative z-10 text-center">
        {/* Pilot Batch Special Badge */}
        {wasInPilotBatch && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-4">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-purple-600">
              {t("acceleration.pilotBatchBadge", "Participante do Batch Piloto")}
            </span>
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <Swords className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
            {t("acceleration.warProtocol", "Protocolo de Guerra")}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-black mb-2">
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            BuildUP
          </span>
        </h3>
        
        {/* Different message for pilot batch users */}
        {wasInPilotBatch ? (
          <p className="text-lg text-slate-600 mb-6">
            {t("acceleration.pilotBatchMessage", "Você participou do batch piloto! Inscreva-se no programa oficial.")}
          </p>
        ) : (
          <p className="text-lg text-slate-600 mb-6">
            {t("acceleration.programSubtitle", "15 Dias para Faturar ou Matar sua Ideia")}
          </p>
        )}

        {/* Mini Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {phases.map((phase) => (
            <div
              key={phase.name}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/80 border border-slate-200 shadow-sm"
            >
              <phase.icon className={`w-5 h-5 ${phase.color}`} />
              <span className="text-xs font-medium text-slate-700">{phase.name}</span>
              <span className="text-[10px] text-slate-500">{phase.days}</span>
            </div>
          ))}
        </div>

        {/* Quote */}
        <p className="text-sm text-slate-500 italic mb-6 max-w-md mx-auto">
          {t("acceleration.quote", '"Pare de brincar de startup. Comece a gerar receita ou mate a ideia."')}
        </p>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/aceleracao')}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold px-8 py-3 h-auto text-base shadow-lg shadow-red-500/25"
        >
          <Swords className="w-5 h-5 mr-2" />
          {wasInPilotBatch 
            ? t("acceleration.enrollNextBatch", "INSCREVER NO PRÓXIMO BATCH")
            : t("acceleration.learnMore", "CONHECER O PROTOCOLO")
          }
        </Button>

        {/* Urgency Text */}
        <p className="text-xs text-slate-500 mt-4">
          {t("acceleration.limitedSlots", "Apenas 30 vagas por cohort")}
        </p>
      </div>
    </div>
  );
};
