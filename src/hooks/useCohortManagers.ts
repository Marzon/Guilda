import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export interface CohortManager {
  id: string;
  cohort_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    archetype: string;
  };
}

export function useCohortManagers(cohortId: string | null) {
  const queryClient = useQueryClient();

  const { data: managers = [], isLoading } = useQuery({
    queryKey: ["cohort-managers", cohortId],
    enabled: !!cohortId,
    queryFn: async () => {
      if (!cohortId) return [];

      // 1. Fetch cohort_managers
      const { data: managersData, error: managersError } = await supabase
        .from("cohort_managers")
        .select("id, cohort_id, user_id, assigned_by, assigned_at")
        .eq("cohort_id", cohortId)
        .order("assigned_at", { ascending: false });

      if (managersError) throw managersError;
      if (!managersData || managersData.length === 0) return [];

      // 2. Fetch profiles for those user_ids
      const userIds = managersData.map((m) => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, archetype")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // 3. Combine data
      return managersData.map((m) => ({
        id: m.id,
        cohort_id: m.cohort_id,
        user_id: m.user_id,
        assigned_by: m.assigned_by,
        assigned_at: m.assigned_at,
        profile: profiles?.find((p) => p.id === m.user_id) || undefined,
      })) as CohortManager[];
    },
  });

  const addManager = useMutation({
    mutationFn: async ({ userId, cohortId }: { userId: string; cohortId: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não autenticado");

      // 1. Add to cohort_managers
      const { error: managerError } = await supabase
        .from("cohort_managers")
        .insert({
          user_id: userId,
          cohort_id: cohortId,
          assigned_by: userData.user.id,
        });
      
      if (managerError) throw managerError;

      // 2. Add batch_manager role if not exists
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert(
          { user_id: userId, role: "batch_manager" },
          { onConflict: "user_id,role" }
        );
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-managers"] });
      toast.success(i18n.t("cohort.managerAddSuccess"));
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error(i18n.t("cohort.managerDuplicate"));
      } else {
        toast.error(i18n.t("cohort.managerAddError") + error.message);
      }
    },
  });

  const removeManager = useMutation({
    mutationFn: async ({ managerId, userId }: { managerId: string; userId: string }) => {
      // 1. Remove from cohort_managers
      const { error: removeError } = await supabase
        .from("cohort_managers")
        .delete()
        .eq("id", managerId);
      
      if (removeError) throw removeError;

      // 2. Check if user still manages any cohort
      const { data: remaining } = await supabase
        .from("cohort_managers")
        .select("id")
        .eq("user_id", userId);

      // 3. If no more cohorts, remove batch_manager role
      if (!remaining || remaining.length === 0) {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "batch_manager");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-managers"] });
      toast.success(i18n.t("cohort.managerRemoveSuccess"));
    },
    onError: (error: Error) => {
      toast.error(i18n.t("cohort.managerRemoveError") + error.message);
    },
  });

  return {
    managers,
    isLoading,
    addManager,
    removeManager,
  };
}

// Hook to check if current user is a batch manager (for conditional access)
export function useIsBatchManager() {
  const { data: authData } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: isBatchManager = false, isLoading } = useQuery({
    queryKey: ["is-batch-manager", authData?.id],
    enabled: !!authData?.id,
    queryFn: async () => {
      if (!authData?.id) return false;
      
      const { data, error } = await supabase.rpc("is_batch_manager", {
        _user_id: authData.id,
      });
      
      if (error) return false;
      return data || false;
    },
  });

  // Also get the cohorts this user manages
  const { data: managedCohortIds = [] } = useQuery({
    queryKey: ["managed-cohorts", authData?.id],
    enabled: !!authData?.id && isBatchManager,
    queryFn: async () => {
      if (!authData?.id) return [];
      
      const { data, error } = await supabase
        .from("cohort_managers")
        .select("cohort_id")
        .eq("user_id", authData.id);
      
      if (error) return [];
      return data.map((c) => c.cohort_id);
    },
  });

  return {
    isBatchManager,
    managedCohortIds,
    isLoading,
  };
}
