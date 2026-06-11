import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw, Sparkles, Play, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePivoterAnalysis } from "@/hooks/usePivoterAnalysis";
import { useFounderVideos } from "@/hooks/useCohortVideos";
import { PivoterAnalysisSummary } from "./PivoterAnalysisSummary";
import { PivoterRecommendations } from "./PivoterRecommendations";
import { PivoterIdeasGrid } from "./PivoterIdeasGrid";
import { VideoOverlay } from "../VideoOverlay";

interface PivoterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  cohortId: string;
  submissionId?: string;
}

export function PivoterDialog({
  open,
  onOpenChange,
  userId,
  cohortId,
  submissionId,
}: PivoterDialogProps) {
  const { t } = useTranslation();
  const {
    existingAnalysis,
    isLoading,
    isGenerating,
    generateAnalysis,
    analysisData,
  } = usePivoterAnalysis(userId, cohortId);

  // Video hooks for final video (day 16 = post-pivoter)
  const { getVideoForDay, hasWatchedVideo, markWatched } = useFounderVideos(userId, cohortId);
  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);
  const finalVideo = getVideoForDay(16);
  const hasWatchedFinal = finalVideo ? hasWatchedVideo(finalVideo.id) : false;

  // Auto-generate analysis when dialog opens if no existing analysis
  useEffect(() => {
    if (open && !existingAnalysis && !isLoading && !isGenerating) {
      generateAnalysis.mutate({ submissionId });
    }
  }, [open, existingAnalysis, isLoading, isGenerating, submissionId]);

  const handleRegenerate = () => {
    generateAnalysis.mutate({ submissionId });
  };

  const handleWatchVideo = () => {
    setVideoOverlayOpen(true);
  };

  const handleVideoWatched = (videoId: string, completed: boolean, durationSeconds?: number) => {
    markWatched.mutate({ videoId, completed, durationSeconds });
  };

  const isProcessing = isLoading || isGenerating;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {t("acceleration.pivoter.title", "Guilda Pivoter")}
                </DialogTitle>
                <DialogDescription>
                  {t("acceleration.pivoter.subtitle", "Análise estratégica e recomendações de pivot para seu negócio")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse" />
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 relative" />
                  </div>
                  <p className="text-muted-foreground text-center">
                    {t("acceleration.pivoter.analyzing", "Analisando seu histórico de entregas...")}
                  </p>
                  <p className="text-sm text-muted-foreground/70 text-center max-w-md">
                    {t("acceleration.pivoter.analyzingHint", "O Pivot Architect está revisando todas as suas submissões para criar recomendações personalizadas")}
                  </p>
                </div>
              ) : analysisData ? (
                <>
                  {/* Analysis Summary */}
                  <PivoterAnalysisSummary summary={analysisData.analysis_summary} />

                  {/* Optimization Recommendations */}
                  <PivoterRecommendations recommendations={analysisData.optimization_recommendations} />

                  {/* Pivot Ideas */}
                  <PivoterIdeasGrid pivots={analysisData.pivots} />

                  {/* Final Video Button - Only show if video exists */}
                  {finalVideo && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleWatchVideo}
                        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white gap-2"
                        size="lg"
                      >
                        <Play className="w-5 h-5" />
                        {hasWatchedFinal
                          ? t("acceleration.video.rewatchFinal", "Rever Mensagem Final")
                          : t("acceleration.video.watchFinal", "Assistir Mensagem Final")
                        }
                        {hasWatchedFinal && <CheckCircle className="w-4 h-4 ml-1" />}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-center">
                    {t("acceleration.pivoter.noAnalysis", "Nenhuma análise disponível")}
                  </p>
                  <Button onClick={handleRegenerate}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("acceleration.pivoter.generate", "Gerar Análise")}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-3 sm:px-6 py-3 pb-6 sm:py-4 sm:pb-4 border-t bg-muted/30 flex flex-col-reverse sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left w-full sm:w-auto">
              {existingAnalysis?.updated_at && (
                <>
                  {t("acceleration.pivoter.lastUpdated", "Última atualização")}: {" "}
                  {new Date(existingAnalysis.updated_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isProcessing}
                className="flex-1 sm:flex-none text-xs sm:text-sm h-9"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0 ${isGenerating ? "animate-spin" : ""}`} />
                <span className="truncate">{t("acceleration.pivoter.regenerate", "Regerar")}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none text-xs sm:text-sm h-9"
              >
                {t("common.close", "Fechar")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Overlay for Final Video */}
      <VideoOverlay
        video={finalVideo}
        open={videoOverlayOpen}
        onOpenChange={setVideoOverlayOpen}
        onWatched={handleVideoWatched}
        autoPlay={true}
      />
    </>
  );
}
