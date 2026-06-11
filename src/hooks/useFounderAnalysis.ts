import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export type FounderArchetype = "BUILDER_ADDICT" | "PREMATURE_CEO" | "FAKER" | "CYCLOTHYMIC" | "UNKNOWN";
export type TrapType = "NICHE_FEAR" | "LP_DESERT" | "PIVOT_ADDICTION" | "MOM_VALIDATION" | "SYNTHETIC_VALIDATION" | "PREMATURE_SCALE" | "SILENCE_ALERT" | "FAKE_WORK" | "VANITY_MARKETING";
export type TrapSeverity = "info" | "warning" | "critical";

export interface FounderArchetypeAnalysis {
  id: string;
  user_id: string;
  cohort_id: string;
  archetype: FounderArchetype;
  confidence_score: number;
  indicators: Record<string, unknown>;
  detected_at: string;
  last_updated_at: string;
}

export interface FounderTrapAlert {
  id: string;
  user_id: string;
  cohort_id: string;
  trap_type: TrapType;
  severity: TrapSeverity;
  trigger_data: Record<string, unknown>;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// Archetype labels and descriptions
export const ARCHETYPE_CONFIG: Record<FounderArchetype, { label: string; description: string; icon: string; color: string }> = {
  BUILDER_ADDICT: {
    label: "Construtor Viciado",
    description: "Passa o dia programando, criando LPs, configurando CRM. Zona de conforto técnico.",
    icon: "🔧",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  PREMATURE_CEO: {
    label: "CEO Prematuro",
    description: "Quer escalar antes de validar. Delega antes de dominar.",
    icon: "👔",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  FAKER: {
    label: "Ilusionista",
    description: "Respostas curtas, entregas atrasadas, foco cosmético. Movimento sem progresso.",
    icon: "🎭",
    color: "bg-red-500/20 text-red-400 border-red-500/30"
  },
  CYCLOTHYMIC: {
    label: "Ciclotímico",
    description: "Um dia de herói, dois dias de sumiço. Dependência de dopamina.",
    icon: "🎢",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
  UNKNOWN: {
    label: "Não Classificado",
    description: "Perfil ainda sendo analisado.",
    icon: "❓",
    color: "bg-muted text-muted-foreground border-muted"
  }
};

// Trap labels and descriptions
export const TRAP_CONFIG: Record<TrapType, { label: string; description: string; icon: string }> = {
  NICHE_FEAR: {
    label: "Fuga do Nicho",
    icon: "🎯",
    description: "Medo de escolher público específico"
  },
  LP_DESERT: {
    label: "Deserto da LP",
    icon: "🏜️",
    description: "LP no ar sem tráfego ativo"
  },
  PIVOT_ADDICTION: {
    label: "Vício no Pivô",
    icon: "🔄",
    description: "Muda ideia a cada dificuldade"
  },
  MOM_VALIDATION: {
    label: "Validação de Mãe",
    icon: "👩‍👦",
    description: "Feedback de amigos ≠ validação"
  },
  SYNTHETIC_VALIDATION: {
    label: "Validação Sintética",
    icon: "🤖",
    description: "Acha que validou porque a IA aprovou"
  },
  PREMATURE_SCALE: {
    label: "Escala Prematura",
    icon: "📈",
    description: "Quer escalar antes de dominar"
  },
  SILENCE_ALERT: {
    label: "Alerta de Silêncio",
    icon: "🔇",
    description: "Inativo por mais de 24h"
  },
  FAKE_WORK: {
    label: "Trabalho Falso",
    icon: "🎪",
    description: "Movimento sem progresso real"
  },
  VANITY_MARKETING: {
    label: "Marketing de Vaidade",
    icon: "📱",
    description: "Posts sem outbound ativo"
  }
};

export function useFounderAnalysis(cohortId: string | null) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch all archetype analyses for a cohort
  const { data: archetypes, isLoading: archetypesLoading } = useQuery({
    queryKey: ["founder-archetypes", cohortId],
    enabled: !!cohortId,
    queryFn: async () => {
      if (!cohortId) return [];
      
      const { data, error } = await supabase
        .from("founder_archetype_analysis")
        .select("*")
        .eq("cohort_id", cohortId);

      if (error) throw error;
      return data as FounderArchetypeAnalysis[];
    }
  });

  // Fetch all active trap alerts for a cohort
  const { data: trapAlerts, isLoading: trapsLoading } = useQuery({
    queryKey: ["founder-traps", cohortId],
    enabled: !!cohortId,
    refetchInterval: 60000, // Refresh every minute
    queryFn: async () => {
      if (!cohortId) return [];
      
      const { data, error } = await supabase
        .from("founder_trap_alerts")
        .select("*")
        .eq("cohort_id", cohortId)
        .eq("resolved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FounderTrapAlert[];
    }
  });

  // Update founder archetype
  const updateArchetype = useMutation({
    mutationFn: async ({ userId, archetype, indicators }: { userId: string; archetype: FounderArchetype; indicators?: Record<string, unknown> }) => {
      if (!cohortId) throw new Error("No cohort selected");

      const { error } = await supabase
        .from("founder_archetype_analysis")
        .upsert([{
          user_id: userId,
          cohort_id: cohortId,
          archetype,
          confidence_score: 1.0,
          indicators: (indicators || {}) as unknown as null,
          last_updated_at: new Date().toISOString()
        }], {
          onConflict: "user_id,cohort_id"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["founder-archetypes", cohortId] });
      toast.success(t("admin.warroom.archetypeUpdated", "Arquétipo atualizado"));
    },
    onError: (error) => {
      toast.error(t("admin.warroom.archetypeError", "Erro ao atualizar arquétipo") + ": " + error.message);
    }
  });

  // Resolve a trap alert
  const resolveTrap = useMutation({
    mutationFn: async (trapId: string) => {
      const { error } = await supabase
        .from("founder_trap_alerts")
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq("id", trapId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["founder-traps", cohortId] });
      toast.success(t("admin.warroom.trapResolved", "Alerta resolvido"));
    },
    onError: (error) => {
      toast.error(t("admin.warroom.trapResolveError", "Erro ao resolver alerta") + ": " + error.message);
    }
  });

  // Helper to get archetype for a specific user
  const getArchetypeForUser = (userId: string): FounderArchetypeAnalysis | undefined => {
    return archetypes?.find(a => a.user_id === userId);
  };

  // Helper to get active traps for a specific user
  const getTrapsForUser = (userId: string): FounderTrapAlert[] => {
    return trapAlerts?.filter(t => t.user_id === userId) || [];
  };

  // Get trap counts by severity
  const getTrapStats = () => {
    if (!trapAlerts) return { info: 0, warning: 0, critical: 0, total: 0 };
    
    return {
      info: trapAlerts.filter(t => t.severity === "info").length,
      warning: trapAlerts.filter(t => t.severity === "warning").length,
      critical: trapAlerts.filter(t => t.severity === "critical").length,
      total: trapAlerts.length
    };
  };

  return {
    archetypes,
    trapAlerts,
    isLoading: archetypesLoading || trapsLoading,
    updateArchetype,
    resolveTrap,
    getArchetypeForUser,
    getTrapsForUser,
    getTrapStats
  };
}
