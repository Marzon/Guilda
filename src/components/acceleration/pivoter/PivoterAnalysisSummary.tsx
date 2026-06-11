import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, AlertTriangle, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AnalysisSummary } from "@/hooks/usePivoterAnalysis";

interface PivoterAnalysisSummaryProps {
  summary: AnalysisSummary;
}

export function PivoterAnalysisSummary({ summary }: PivoterAnalysisSummaryProps) {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          {t("acceleration.pivoter.summary.title", "Resumo da Análise")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Growth Score */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("acceleration.pivoter.summary.growthScore", "Potencial de Crescimento")}
              </p>
              <p className={`text-2xl font-bold ${getScoreColor(summary.growth_score)}`}>
                {summary.growth_score}/100
              </p>
            </div>
          </div>
          <div className="w-32">
            <Progress 
              value={summary.growth_score} 
              className="h-3"
              style={{
                ["--progress-background" as string]: getProgressColor(summary.growth_score),
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Value Proposition */}
          <div className="p-4 rounded-lg bg-background/50 border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                <Target className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("acceleration.pivoter.summary.valueProp", "Proposta de Valor Atual")}
                </p>
                <p className="text-sm">{summary.current_value_prop}</p>
              </div>
            </div>
          </div>

          {/* Main Bottleneck */}
          <div className="p-4 rounded-lg bg-background/50 border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("acceleration.pivoter.summary.bottleneck", "Principal Gargalo")}
                </p>
                <p className="text-sm">{summary.main_bottleneck}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
