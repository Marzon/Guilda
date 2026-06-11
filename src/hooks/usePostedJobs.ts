import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

import type { Archetype } from "@/types/archetype";

export interface PostedJob {
  id: string;
  role_name: string;
  role_description: string | null;
  required_archetype: Archetype | null;
  required_skills: string[] | null;
  is_filled: boolean;
  created_at: string;
  project_id: string;
  project: {
    id: string;
    title: string;
    cover_image_url: string | null;
  };
  applications_count: number;
  pending_applications_count: number;
}

export const usePostedJobs = () => {
  const queryClient = useQueryClient();

  const { data: postedJobs = [], isLoading } = useQuery({
    queryKey: ["my-posted-jobs"],
    queryFn: async (): Promise<PostedJob[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all projects owned by user
      const { data: userProjects, error: projectsError } = await supabase
        .from("projects")
        .select("id, title, cover_image_url")
        .eq("owner_id", user.id);

      if (projectsError || !userProjects?.length) return [];

      const projectIds = userProjects.map(p => p.id);

      // Get all roles for those projects
      const { data: roles, error: rolesError } = await supabase
        .from("project_roles")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (rolesError) {
        console.error("Error fetching posted jobs:", rolesError);
        return [];
      }

      // Get application counts for each role
      const { data: applications } = await supabase
        .from("project_applications")
        .select("role_id, status")
        .in("role_id", roles?.map(r => r.id) || []);

      // Map roles with project info and application counts
      const postedJobsWithCounts: PostedJob[] = (roles || []).map(role => {
        const project = userProjects.find(p => p.id === role.project_id);
        const roleApplications = applications?.filter(a => a.role_id === role.id) || [];
        
        return {
          ...role,
          project: {
            id: project?.id || "",
            title: project?.title || "",
            cover_image_url: project?.cover_image_url || null,
          },
          applications_count: roleApplications.length,
          pending_applications_count: roleApplications.filter(a => a.status === "PENDING").length,
        };
      });

      return postedJobsWithCounts;
    },
  });

  const addJob = useMutation({
    mutationFn: async (jobData: {
      project_id: string;
      role_name: string;
      role_description?: string;
      required_archetype?: "BUILDER" | "SELLER" | null;
      required_skills?: string[];
    }) => {
      const { error } = await supabase
        .from("project_roles")
        .insert({
          project_id: jobData.project_id,
          role_name: jobData.role_name,
          role_description: jobData.role_description || null,
          required_archetype: jobData.required_archetype || null,
          required_skills: jobData.required_skills || [],
          is_filled: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(i18n.t("jobs.created", "Vaga criada com sucesso!"));
    },
    onError: (error) => {
      console.error("Failed to create job:", error);
      toast.error(i18n.t("jobs.createError", "Erro ao criar vaga"));
    },
  });

  const updateJob = useMutation({
    mutationFn: async ({ 
      jobId, 
      updates 
    }: { 
      jobId: string; 
      updates: Partial<PostedJob>;
    }) => {
      const { error } = await supabase
        .from("project_roles")
        .update(updates)
        .eq("id", jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(i18n.t("jobs.updated", "Vaga atualizada!"));
    },
    onError: (error) => {
      console.error("Failed to update job:", error);
      toast.error(i18n.t("jobs.updateError", "Erro ao atualizar vaga"));
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("project_roles")
        .delete()
        .eq("id", jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(i18n.t("jobs.deleted", "Vaga removida!"));
    },
    onError: (error) => {
      console.error("Failed to delete job:", error);
      toast.error(i18n.t("jobs.deleteError", "Erro ao remover vaga"));
    },
  });

  const toggleJobStatus = useMutation({
    mutationFn: async ({ jobId, isFilled }: { jobId: string; isFilled: boolean }) => {
      const { error } = await supabase
        .from("project_roles")
        .update({ is_filled: isFilled })
        .eq("id", jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      console.error("Failed to toggle job status:", error);
      toast.error(i18n.t("jobs.statusError", "Erro ao alterar status"));
    },
  });

  return {
    postedJobs,
    openJobs: postedJobs.filter(j => !j.is_filled),
    filledJobs: postedJobs.filter(j => j.is_filled),
    isLoading,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
  };
};
