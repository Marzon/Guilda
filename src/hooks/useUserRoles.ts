import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at?: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    archetype: string;
  };
}

export function useUserRoles() {
  const queryClient = useQueryClient();

  // Fetch all user roles with profile info
  const { data: userRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      // First get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(roles.map((r) => r.user_id))];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, archetype")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Map profiles to roles
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return roles.map((role) => ({
        ...role,
        profile: profileMap.get(role.user_id) || undefined,
      })) as UserRole[];
    },
  });

  // Search users for adding roles
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, archetype")
      .ilike("username", `%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  // Add role mutation
  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este usuário já possui esta permissão");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success("Permissão adicionada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar permissão");
    },
  });

  // Remove role mutation
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Remove the role
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      // If removing batch_manager, also remove from cohort_managers
      if (role === "batch_manager") {
        await supabase
          .from("cohort_managers")
          .delete()
          .eq("user_id", userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["cohort-managers"] });
      toast.success("Permissão removida com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover permissão");
    },
  });

  // Separate roles by type
  const admins = userRoles?.filter((r) => r.role === "admin") || [];
  const batchManagers = userRoles?.filter((r) => r.role === "batch_manager") || [];

  return {
    userRoles,
    admins,
    batchManagers,
    loadingRoles,
    searchUsers,
    addRole,
    removeRole,
  };
}
