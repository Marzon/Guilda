import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface UseProjectActionsOptions {
  projectId: string;
  onDeleteSuccess?: () => void;
}

interface ProjectUpdate {
  title?: string;
  description?: string | null;
  status?: "IDEA" | "MVP" | "SCALE";
  is_recruiting?: boolean;
  is_showcase?: boolean;
  seeking_capital?: boolean;
  capital_amount_sought?: number | null;
  cover_image_url?: string | null;
}

export const useProjectActions = ({ projectId, onDeleteSuccess }: UseProjectActionsOptions) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: ProjectUpdate) => {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ["project-settings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-owned-projects"] });
      toast.success(t("common.success"));
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Delete project mutation with RLS verification
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .select();

      if (error) throw error;
      
      // Verify deletion actually happened (RLS may silently block)
      if (!data || data.length === 0) {
        throw new Error("Não foi possível deletar o projeto. Verifique se você é o proprietário.");
      }
    },
    onSuccess: () => {
      // Invalidate all project-related caches
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-owned-projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-member-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-settings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      
      toast.success("Projeto deletado com sucesso!");
      onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Helper functions for specific toggles
  const toggleRecruiting = (checked: boolean) => {
    updateMutation.mutate({ is_recruiting: checked });
  };

  const toggleShowcase = (checked: boolean) => {
    updateMutation.mutate({ is_showcase: checked });
  };

  const toggleSeekingCapital = (checked: boolean) => {
    if (!checked) {
      updateMutation.mutate({ seeking_capital: false, capital_amount_sought: null });
    } else {
      updateMutation.mutate({ seeking_capital: true });
    }
  };

  const saveCapitalAmount = (amount: number) => {
    updateMutation.mutate({ seeking_capital: true, capital_amount_sought: amount });
  };

  return {
    // Mutations
    updateProject: updateMutation.mutate,
    updateProjectAsync: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutate,
    
    // Loading states
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Toggle helpers
    toggleRecruiting,
    toggleShowcase,
    toggleSeekingCapital,
    saveCapitalAmount,
  };
};
