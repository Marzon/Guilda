import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rocket, Star, DollarSign, Calendar, ChevronRight, Lightbulb, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PivotIdea } from "@/hooks/usePivoterAnalysis";

interface PivoterIdeasGridProps {
  pivots: PivotIdea[];
}

// Extended pivot type to handle both old and new API formats
interface ExtendedPivot {
  id?: number;
  // New format fields
  name?: string;
  type?: string;
  concept?: string;
  transformation?: string;
  power_reason?: string;
  tech_difficulty?: number;
  monetization_model?: string;
  mvp_7_days?: string;
  // Old format fields (from AI that used different field names)
  title?: string;
  category?: string;
  description?: string;
  target_audience?: string;
  revenue_model?: string;
  competitive_edge?: string;
  first_48h_action?: string;
  difficulty?: number;
}

// Helper functions to normalize pivot data from various API response formats
const normalizePivot = (pivot: ExtendedPivot, index: number) => ({
  id: pivot.id || index + 1,
  name: pivot.name || pivot.title || `Pivot ${index + 1}`,
  type: pivot.type || pivot.category || "Outro",
  concept: pivot.concept || pivot.description || "",
  transformation: pivot.transformation || pivot.competitive_edge || "",
  power_reason: pivot.power_reason || pivot.target_audience || "",
  tech_difficulty: pivot.tech_difficulty || pivot.difficulty || 3,
  monetization_model: pivot.monetization_model || pivot.revenue_model || "",
  mvp_7_days: pivot.mvp_7_days || pivot.first_48h_action || "",
});

export function PivoterIdeasGrid({ pivots }: PivoterIdeasGridProps) {
  const { t } = useTranslation();
  const [selectedPivot, setSelectedPivot] = useState<ReturnType<typeof normalizePivot> | null>(null);

  // Normalize all pivots on render
  const normalizedPivots = pivots.map((p, i) => normalizePivot(p as unknown as ExtendedPivot, i));

  const getDifficultyStars = (difficulty: number) => {
    const safeValue = Math.min(5, Math.max(0, difficulty || 0));
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < safeValue ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  const getTypeColor = (type?: string) => {
    if (!type) return "bg-muted text-muted-foreground";
    const lowerType = type.toLowerCase();
    if (lowerType.includes("saas")) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (lowerType.includes("marketplace")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    if (lowerType.includes("app")) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (lowerType.includes("api") || lowerType.includes("dev")) return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
    if (lowerType.includes("ia") || lowerType.includes("automação")) return "bg-pink-500/10 text-pink-600 border-pink-500/20";
    if (lowerType.includes("serviço") || lowerType.includes("servico")) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    if (lowerType.includes("info")) return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    if (lowerType.includes("b2b") || lowerType.includes("b2c")) return "bg-teal-500/10 text-teal-600 border-teal-500/20";
    if (lowerType.includes("assinatura")) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    return "bg-muted text-muted-foreground";
  };

  if (!pivots || pivots.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("acceleration.pivoter.noPivots", "Nenhum pivot gerado ainda")}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-500" />
            {t("acceleration.pivoter.pivots.title", "Pivots Estratégicos")}
            <Badge variant="secondary" className="ml-2">
              {normalizedPivots.length} {t("acceleration.pivoter.pivots.ideas", "ideias")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {normalizedPivots.map((pivot) => (
              <button
                key={pivot.id}
                onClick={() => setSelectedPivot(pivot)}
                className="text-left p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                        {pivot.id}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(pivot.type)}`}>
                        {pivot.type}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h4 className="font-semibold line-clamp-2">{pivot.name}</h4>
                  
                  {pivot.concept && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pivot.concept}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-0.5">
                      {getDifficultyStars(pivot.tech_difficulty)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t("acceleration.pivoter.pivots.difficulty", "Dificuldade")}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pivot Detail Dialog */}
      <Dialog open={!!selectedPivot} onOpenChange={() => setSelectedPivot(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {selectedPivot && (
            <>
              <DialogHeader className="shrink-0">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                    {selectedPivot.id}
                  </span>
                  <div>
                    <Badge variant="outline" className={`mb-1 ${getTypeColor(selectedPivot.type)}`}>
                      {selectedPivot.type}
                    </Badge>
                    <DialogTitle className="text-xl">{selectedPivot.name}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-5 pr-4 pb-4">
                  {/* Concept */}
                  {selectedPivot.concept && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <h5 className="font-semibold text-sm">
                          {t("acceleration.pivoter.pivots.concept", "Conceito")}
                        </h5>
                      </div>
                      <p className="text-sm">{selectedPivot.concept}</p>
                    </div>
                  )}

                  {/* Transformation */}
                  {selectedPivot.transformation && (
                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <h5 className="font-semibold text-sm">
                          {t("acceleration.pivoter.pivots.transformation", "O que Muda")}
                        </h5>
                      </div>
                      <p className="text-sm">{selectedPivot.transformation}</p>
                    </div>
                  )}

                  {/* Power Reason */}
                  {selectedPivot.power_reason && (
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <h5 className="font-semibold text-sm">
                          {t("acceleration.pivoter.pivots.powerReason", "Por que Funciona")}
                        </h5>
                      </div>
                      <p className="text-sm">{selectedPivot.power_reason}</p>
                    </div>
                  )}

                  {/* MVP 7 Days */}
                  {selectedPivot.mvp_7_days && (
                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <h5 className="font-semibold text-sm">
                          {t("acceleration.pivoter.pivots.mvp", "MVP em 7 Dias")}
                        </h5>
                      </div>
                      <p className="text-sm">{selectedPivot.mvp_7_days}</p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {t("acceleration.pivoter.pivots.techDifficulty", "Dificuldade Técnica")}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {getDifficultyStars(selectedPivot.tech_difficulty)}
                        </div>
                      </div>
                      {selectedPivot.monetization_model && (
                        <>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {t("acceleration.pivoter.pivots.monetization", "Monetização")}
                            </p>
                            <Badge variant="outline">
                              {selectedPivot.monetization_model}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end pt-4 border-t shrink-0">
                <Button onClick={() => setSelectedPivot(null)}>
                  {t("common.close", "Fechar")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
