import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowUp, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OptimizationRecommendation } from "@/hooks/usePivoterAnalysis";

interface PivoterRecommendationsProps {
  recommendations: OptimizationRecommendation[];
}

export function PivoterRecommendations({ recommendations }: PivoterRecommendationsProps) {
  const { t } = useTranslation();

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "Baixo":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Médio":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Alto":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          {t("acceleration.pivoter.recommendations.title", "Otimizações Recomendadas")}
          <Badge variant="secondary" className="ml-2">
            {t("acceleration.pivoter.recommendations.quickWins", "Quick Wins")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold">{rec.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-8">{rec.action}</p>
                  <div className="flex items-center gap-4 pl-8 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>{rec.impact}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getEffortColor(rec.effort)}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {t("acceleration.pivoter.recommendations.effort", "Esforço")}: {rec.effort}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
