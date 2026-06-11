import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Loader2, Hammer, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useStartupCanvas } from "@/hooks/useStartupCanvas";
import { useUserCohort } from "@/hooks/useUserCohort";
import { useAccelerationTeam } from "@/hooks/useAccelerationTeam";
import { StartupCanvasPhase } from "@/components/acceleration/StartupCanvasPhase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/lib/routes";

const StartupCanvas = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: auth } = useAuth();
  const userId = auth?.user?.id || null;
  const { isEnrolled, cohortId, cohortName, loading: enrollmentLoading } = useUserCohort(userId);

  const { 
    groupedByPhase, 
    totalCompletedDays, 
    totalDays, 
    isLoading: canvasLoading,
  } = useStartupCanvas(userId, cohortId || null);

  const { team, teamLoading, hasTeam } = useAccelerationTeam(userId, cohortId || null);

  // Redirect if not enrolled
  useEffect(() => {
    if (!enrollmentLoading && !isEnrolled) {
      navigate(ROUTES.aceleracao);
    }
  }, [isEnrolled, enrollmentLoading, navigate]);

  const isLoading = enrollmentLoading || canvasLoading || teamLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const progressPercent = totalDays > 0 
    ? Math.round((totalCompletedDays / totalDays) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Back button */}
          <button
          onClick={() => navigate("/tavern?tab=acceleration")}
            className="flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("canvas.backToProgram", "Voltar ao programa")}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {hasTeam && team?.startup_name ? team.startup_name : t("canvas.title", "Construção da Startup")}
              </h1>
              {cohortName && (
                <p className="text-purple-200 text-sm">{cohortName}</p>
              )}
            </div>
          </div>

          {/* Team Members */}
          {hasTeam && team && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {team.builder && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={team.builder.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-amber-500/20 text-amber-200">
                      {team.builder.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">@{team.builder.username}</span>
                  <Hammer className="w-3.5 h-3.5 text-amber-400" />
                </div>
              )}
              
              {team.seller && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={team.seller.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-green-500/20 text-green-200">
                      {team.seller.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">@{team.seller.username}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
              <span>
                {t("canvas.progress", "Progresso geral")}
              </span>
              <span className="font-mono">
                {totalCompletedDays}/{totalDays} {t("canvas.days", "dias")} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-purple-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {totalCompletedDays === 0 ? (
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">
              {t("canvas.noProgress", "Nenhum progresso ainda")}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {t("canvas.noProgressDescription", "Complete as tarefas do programa para ver sua construção aqui.")}
            </p>
            <Button
              onClick={() => navigate("/tavern?tab=acceleration")}
              variant="outline"
            >
              {t("canvas.startNow", "Começar agora")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByPhase.map((phase, index) => (
              <StartupCanvasPhase 
                key={phase.id} 
                phase={phase}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {totalCompletedDays > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              {t("canvas.footerText", "Continue completando as tarefas para construir sua startup!")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupCanvas;
