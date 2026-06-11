import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export interface ShowcaseRequest {
  id: string;
  project_id: string;
  requester_id: string;
  status: "pending" | "approved" | "rejected";
  request_type: "owner_request" | "admin_suggestion";
  reviewer_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  project?: {
    id: string;
    title: string;
    description?: string | null;
    status?: string;
    owner_id: string;
    is_showcase?: boolean;
    created_at?: string;
  };
  requester?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export const useShowcaseRequests = (projectId?: string) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);
  const queryClient = useQueryClient();

  // Get request for a specific project (for project owner)
  const { data: projectRequest, isLoading: isLoadingProject } = useQuery({
    queryKey: ["showcase-request", projectId],
    queryFn: async (): Promise<ShowcaseRequest | null> => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("showcase_requests")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ShowcaseRequest | null;
    },
    enabled: !!projectId && !!userId,
  });

  // Get all pending requests (for admin) - both owner requests and admin suggestions
  // Filter out projects that are already public (is_showcase = true)
  const { data: pendingRequests = [], isLoading: isLoadingPending } = useQuery({
    queryKey: ["showcase-requests-pending"],
    queryFn: async (): Promise<ShowcaseRequest[]> => {
      const { data, error } = await supabase
        .from("showcase_requests")
        .select(`
          *,
          project:projects!inner(id, title, description, status, owner_id, is_showcase, created_at),
          requester:profiles!showcase_requests_requester_id_fkey(id, username, avatar_url)
        `)
        .eq("status", "pending")
        .eq("project.is_showcase", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as ShowcaseRequest[];
    },
    enabled: !!userId,
  });

  // Get pending admin suggestions for a specific project (for owner to approve)
  const { data: adminSuggestion, isLoading: isLoadingAdminSuggestion } = useQuery({
    queryKey: ["showcase-admin-suggestion", projectId],
    queryFn: async (): Promise<ShowcaseRequest | null> => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("showcase_requests")
        .select("*")
        .eq("project_id", projectId)
        .eq("request_type", "admin_suggestion")
        .eq("status", "pending")
        .maybeSingle();

      if (error) throw error;
      return data as ShowcaseRequest | null;
    },
    enabled: !!projectId && !!userId,
  });

  // Create a new showcase request (owner requesting)
  const createRequest = useMutation({
    mutationFn: async (projectId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate: check if project is already public
      const { data: project } = await supabase
        .from("projects")
        .select("is_showcase")
        .eq("id", projectId)
        .single();

      if (project?.is_showcase) {
        throw new Error("Este projeto já está publicado no Discovery");
      }

      const { error } = await supabase
        .from("showcase_requests")
        .insert({
          project_id: projectId,
          requester_id: user.id,
          status: "pending",
          request_type: "owner_request",
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Já existe uma solicitação pendente para este projeto");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-request"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["project-updates"] });
      toast.success("Solicitação enviada! Aguarde a aprovação do admin.");
    },
    onError: (error: Error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Admin suggests showcase to owner
  const suggestShowcase = useMutation({
    mutationFn: async ({ projectId, ownerId }: { projectId: string; ownerId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate: check if project is already public
      const { data: project } = await supabase
        .from("projects")
        .select("is_showcase")
        .eq("id", projectId)
        .single();

      if (project?.is_showcase) {
        throw new Error("Este projeto já está publicado no Discovery");
      }

      // Check if there's already a pending request for this project
      const { data: existing } = await supabase
        .from("showcase_requests")
        .select("id")
        .eq("project_id", projectId)
        .eq("status", "pending")
        .maybeSingle();

      if (existing) {
        throw new Error("Já existe uma solicitação pendente para este projeto");
      }

      const { error } = await supabase
        .from("showcase_requests")
        .insert({
          project_id: projectId,
          requester_id: user.id,
          status: "pending",
          request_type: "admin_suggestion",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-request"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-admin-suggestion"] });
      queryClient.invalidateQueries({ queryKey: ["project-updates"] });
      toast.success("Sugestão enviada ao proprietário!");
    },
    onError: (error: Error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Approve a request (admin only for owner_request, owner for admin_suggestion)
  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("showcase_requests")
        .update({
          status: "approved",
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-request"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-admin-suggestion"] });
      queryClient.invalidateQueries({ queryKey: ["project-updates"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["project-settings"] });
      toast.success("Projeto aprovado para Discovery!");
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Reject a request (admin only for owner_request, owner for admin_suggestion)
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("showcase_requests")
        .update({
          status: "rejected",
          reviewer_id: user.id,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-request"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-admin-suggestion"] });
      queryClient.invalidateQueries({ queryKey: ["project-updates"] });
      toast.success("Solicitação rejeitada");
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Separate counts by request type
  const ownerRequestsPending = pendingRequests.filter(r => r.request_type === "owner_request");
  const adminSuggestionsPending = pendingRequests.filter(r => r.request_type === "admin_suggestion");

  return {
    projectRequest,
    pendingRequests,
    ownerRequestsPending,
    adminSuggestionsPending,
    adminSuggestion,
    isLoadingProject,
    isLoadingPending,
    isLoadingAdminSuggestion,
    createRequest,
    suggestShowcase,
    approveRequest,
    rejectRequest,
    pendingCount: pendingRequests.length,
    ownerRequestsCount: ownerRequestsPending.length,
    adminSuggestionsCount: adminSuggestionsPending.length,
  };
};
