import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from "./useIsAdmin";

export function useTestMode(userId: string | null, cohortId: string | null) {
  const queryClient = useQueryClient();

  // Use centralized admin hook
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Check if user is batch_manager of this cohort
  const { data: isCohortManager = false, isLoading: isCohortManagerLoading } = useQuery({
    queryKey: ["is-cohort-manager", userId, cohortId],
    enabled: !!userId && !!cohortId && !isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("cohort_managers")
        .select("id")
        .eq("user_id", userId!)
        .eq("cohort_id", cohortId!)
        .maybeSingle();
      return !!data;
    },
  });

  const canUseTestMode = isAdmin || isCohortManager;
  const isLoading = isAdminLoading || isCohortManagerLoading;

  // Skip current task (auto-approve)
  const skipTask = useMutation({
    mutationFn: async ({ taskId, currentDay }: { taskId: string; currentDay: number }) => {
      if (!userId || !cohortId) throw new Error("Missing user or cohort");

      // Check existing submission
      const { data: existing } = await supabase
        .from("acceleration_submissions")
        .select("id")
        .eq("user_id", userId)
        .eq("task_id", taskId)
        .maybeSingle();

      if (existing) {
        // Update to approved
        const { error } = await supabase
          .from("acceleration_submissions")
          .update({
            status: "APPROVED",
            content: "[Test Mode - Auto Skip]",
            ai_feedback: "✅ Tarefa aprovada automaticamente via Modo de Teste.",
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Create new approved submission
        const { error } = await supabase
          .from("acceleration_submissions")
          .insert({
            user_id: userId,
            task_id: taskId,
            cohort_id: cohortId,
            content: "[Test Mode - Auto Skip]",
            status: "APPROVED",
            ai_feedback: "✅ Tarefa aprovada automaticamente via Modo de Teste.",
          });
        
        if (error) throw error;
      }

      // Note: Database trigger should auto-advance current_day if needed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["acceleration-progress"] });
      toast.success("⏭️ Tarefa pulada via Modo de Teste!");
    },
    onError: (error) => {
      console.error("Error skipping task:", error);
      toast.error("Erro ao pular tarefa");
    },
  });

  // Go directly to a specific day
  const goToDay = useMutation({
    mutationFn: async (targetDay: number) => {
      if (!userId || !cohortId) throw new Error("Missing user or cohort");

      const { error } = await supabase
        .from("acceleration_user_progress")
        .update({ 
          current_day: targetDay,
          last_activity_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("cohort_id", cohortId);

      if (error) throw error;
      return targetDay;
    },
    onSuccess: async (targetDay) => {
      // Force refetch with exact query keys used by useAccelerationProgress
      await queryClient.refetchQueries({ queryKey: ["acceleration-progress", userId, cohortId] });
      await queryClient.refetchQueries({ queryKey: ["acceleration-submissions", userId, cohortId] });
      toast.success(`📍 Avançado para o Dia ${targetDay}`);
    },
    onError: (error) => {
      console.error("Error changing day:", error);
      toast.error("Erro ao mudar de dia");
    },
  });

  return {
    canUseTestMode,
    isAdmin,
    isCohortManager,
    isLoading,
    skipTask,
    goToDay,
  };
}
