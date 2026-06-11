import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface AnalysisSummary {
  current_value_prop: string;
  main_bottleneck: string;
  growth_score: number;
}

export interface OptimizationRecommendation {
  title: string;
  action: string;
  impact: string;
  effort: "Baixo" | "Médio" | "Alto";
}

export interface PivotIdea {
  id: number;
  name: string;
  type: string;
  concept: string;
  transformation: string;
  power_reason: string;
  tech_difficulty: number;
  monetization_model: string;
  mvp_7_days: string;
}

export interface PivotAnalysisData {
  analysis_summary: AnalysisSummary;
  optimization_recommendations: OptimizationRecommendation[];
  pivots: PivotIdea[];
}

export interface PivotAnalysis {
  id: string;
  user_id: string;
  cohort_id: string;
  submission_id: string | null;
  analysis_data: PivotAnalysisData;
  created_at: string;
  updated_at: string;
}

export function usePivoterAnalysis(userId: string | null, cohortId: string | null) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing analysis
  const { data: existingAnalysis, isLoading } = useQuery({
    queryKey: ["pivot-analysis", userId, cohortId],
    enabled: !!userId && !!cohortId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acceleration_pivot_analysis")
        .select("*")
        .eq("user_id", userId!)
        .eq("cohort_id", cohortId!)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          analysis_data: data.analysis_data as unknown as PivotAnalysisData,
        } as PivotAnalysis;
      }
      return null;
    },
  });

  // Generate new analysis
  const generateAnalysis = useMutation({
    mutationFn: async ({ submissionId }: { submissionId?: string } = {}) => {
      if (!userId || !cohortId) {
        throw new Error("userId and cohortId are required");
      }

      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke("pivot-architect-analysis", {
        body: {
          userId,
          cohortId,
          submissionId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to generate analysis");

      return data.analysis as PivotAnalysisData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pivot-analysis", userId, cohortId] });
      toast.success(t("acceleration.pivoter.analysisComplete", "Análise concluída!"));
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error("Error generating analysis:", error);
      toast.error(t("acceleration.pivoter.analysisError", "Erro ao gerar análise"));
      setIsGenerating(false);
    },
  });

  return {
    existingAnalysis,
    isLoading,
    isGenerating,
    generateAnalysis,
    analysisData: existingAnalysis?.analysis_data || null,
  };
}
