import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

import type { Archetype } from "@/types/archetype";

export interface ProjectMember {
  id: string;
  user_id: string;
  role_id: string | null;
  status: "ACTIVE" | "INACTIVE" | "REMOVED";
  joined_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
    archetype: Archetype;
  };
  role?: {
    role_name: string;
  };
}

interface ProjectRole {
  id: string;
  project_id: string;
  role_name: string;
  role_description: string | null;
  required_archetype: Archetype | null;
  required_skills: string[];
  is_filled: boolean;
  created_at: string;
}

export const useProjectTeam = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async (): Promise<ProjectMember[]> => {
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          profile:profiles!project_members_user_id_fkey(username, avatar_url, archetype),
          role:project_roles!project_members_role_id_fkey(role_name)
        `)
        .eq("project_id", projectId)
        .eq("status", "ACTIVE");

      if (error) {
        console.error("Failed to load team members:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["project-roles", projectId],
    queryFn: async (): Promise<ProjectRole[]> => {
      const { data, error } = await supabase
        .from("project_roles")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load project roles:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!projectId,
  });

  const addRole = useMutation({
    mutationFn: async (roleData: Omit<ProjectRole, "id" | "created_at" | "project_id">) => {
      const { error } = await supabase
        .from("project_roles")
        .insert({ ...roleData, project_id: projectId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-roles", projectId] });
      toast.success(i18n.t("projectTeam.roleAddSuccess"));
    },
    onError: (error) => {
      console.error("Failed to add role:", error);
      toast.error(i18n.t("projectTeam.roleAddError"));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ roleId, updates }: { roleId: string; updates: Partial<ProjectRole> }) => {
      const { error } = await supabase
        .from("project_roles")
        .update(updates)
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-roles", projectId] });
      toast.success(i18n.t("projectTeam.roleUpdateSuccess"));
    },
    onError: (error) => {
      console.error("Failed to update role:", error);
      toast.error(i18n.t("projectTeam.roleUpdateError"));
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId?: string }) => {
      // Check if member already exists (e.g., was previously removed)
      const { data: existingMember } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        // Reactivate existing member
        const { error } = await supabase.from("project_members")
          .update({ status: "ACTIVE", role_id: roleId || null })
          .eq("id", existingMember.id);
        if (error) throw error;
      } else {
        // Insert new member
        const { error } = await supabase
          .from("project_members")
          .insert({
            project_id: projectId,
            user_id: userId,
            role_id: roleId || null,
            status: "ACTIVE",
          });
        if (error) throw error;
      }

      // Mark role as filled if assigned
      if (roleId) {
        await supabase.from("project_roles").update({ is_filled: true }).eq("id", roleId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-roles", projectId] });
      toast.success(i18n.t("projectTeam.memberAddSuccess", "Membro adicionado com sucesso"));
    },
    onError: (error: any) => {
      console.error("Failed to add member:", error);
      if (error.code === "23505") {
        toast.error(i18n.t("projectTeam.memberAlreadyExists", "Este usuário já é membro do projeto"));
      } else {
        toast.error(i18n.t("projectTeam.memberAddError", "Erro ao adicionar membro"));
      }
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      // Get member info before removing
      const member = members.find((m) => m.id === memberId);
      
      const { error } = await supabase
        .from("project_members")
        .update({ status: "REMOVED" })
        .eq("id", memberId);

      if (error) throw error;

      // If member had a role, mark it as not filled
      if (member?.role_id) {
        await supabase.from("project_roles").update({ is_filled: false }).eq("id", member.role_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-roles", projectId] });
      toast.success(i18n.t("projectTeam.memberRemoveSuccess"));
    },
    onError: (error) => {
      console.error("Failed to remove member:", error);
      toast.error(i18n.t("projectTeam.memberRemoveError"));
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("project_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-roles", projectId] });
      toast.success(i18n.t("projectTeam.roleRemoveSuccess"));
    },
    onError: (error) => {
      console.error("Failed to delete role:", error);
      toast.error(i18n.t("projectTeam.roleRemoveError"));
    },
  });

  return {
    members,
    roles,
    openRoles: roles.filter((r) => !r.is_filled),
    isLoading: loadingMembers || loadingRoles,
    addRole,
    updateRole,
    addMember,
    removeMember,
    deleteRole,
  };
};
