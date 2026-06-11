import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CanvasPhase } from "@/hooks/useStartupCanvas";
import { StartupCanvasDay } from "./StartupCanvasDay";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface StartupCanvasPhaseProps {
  phase: CanvasPhase;
  defaultOpen?: boolean;
}

export const StartupCanvasPhase = ({ phase, defaultOpen = false }: StartupCanvasPhaseProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(defaultOpen || phase.completedDays > 0);

  const hasSubmissions = phase.submissions.length > 0;
  const progressPercent = phase.totalDays > 0 
    ? Math.round((phase.completedDays / phase.totalDays) * 100) 
    : 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Phase Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
          
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: phase.color || "#6366f1" }}
          />
          
          <div className="text-left">
            <h3 className="font-semibold text-white">
              {t("canvas.phase", "Fase")} {phase.phase_number}: {phase.name}
            </h3>
            <p className="text-sm text-slate-400">
              {phase.completedDays}/{phase.totalDays} {t("canvas.daysCompleted", "dias completados")}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: phase.color || "#6366f1"
              }}
            />
          </div>
          <span className="text-sm font-mono text-slate-400 min-w-[40px] text-right">
            {progressPercent}%
          </span>
        </div>
      </button>

      {/* Phase Content */}
      {isOpen && (
        <div className="px-4 pb-4">
          {hasSubmissions ? (
            <div className="space-y-3 pt-2 border-t border-slate-700/50">
              {phase.submissions.map((submission) => (
                <StartupCanvasDay key={submission.id} submission={submission} />
              ))}
            </div>
          ) : (
            <div className="pt-4 pb-2 text-center border-t border-slate-700/50">
              <p className="text-sm text-slate-500">
                {t("canvas.noSubmissions", "Nenhuma tarefa completada ainda nesta fase")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
