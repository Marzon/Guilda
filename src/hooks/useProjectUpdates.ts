import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export type UpdateType = "MILESTONE" | "ANNOUNCEMENT" | "HIRING" | "GENERAL" | "CREATED" | "SHOWCASE_REQUESTED" | "SHOWCASE_APPROVED" | "SHOWCASE_REJECTED";

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  type: UpdateType;
  created_at: string;
  author?: {
    username: string;
    avatar_url: string | null;
  };
}

export const useProjectUpdates = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Fetch updates for a project (including virtual creation event)
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["project-updates", projectId],
    queryFn: async (): Promise<ProjectUpdate[]> => {
      if (!projectId) return [];

      // Fetch actual updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("project_updates")
        .select(`
          *,
          author:profiles!project_updates_author_id_fkey(username, avatar_url)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (updatesError) {
        console.error("Error fetching project updates:", updatesError);
        return [];
      }

      // Fetch project for creation date and owner info
      const { data: project } = await supabase
        .from("projects")
        .select(`
          created_at,
          owner:profiles!projects_owner_id_fkey(id, username, avatar_url)
        `)
        .eq("id", projectId)
        .single();

      const realUpdates = (updatesData || []) as unknown as ProjectUpdate[];

      // Add virtual "CREATED" event
      if (project) {
        const creationEvent: ProjectUpdate = {
          id: `created-${projectId}`,
          project_id: projectId,
          author_id: project.owner?.id || "",
          content: "Projeto criado",
          type: "CREATED",
          created_at: project.created_at,
          author: project.owner ? {
            username: project.owner.username,
            avatar_url: project.owner.avatar_url,
          } : undefined,
        };
        return [...realUpdates, creationEvent];
      }

      return realUpdates;
    },
    enabled: !!projectId,
  });

  // Add update
  const addUpdate = useMutation({
    mutationFn: async ({ projectId, content, type }: { projectId: string; content: string; type: Exclude<UpdateType, "CREATED"> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("project_updates")
        .insert({
          project_id: projectId,
          author_id: user.id,
          content,
          type: type as "MILESTONE" | "ANNOUNCEMENT" | "HIRING" | "GENERAL",
        });

      if (error) throw error;

      // Notify users who favorited this project
      const { data: project } = await supabase
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();

      const { data: favorites } = await supabase
        .from("project_favorites")
        .select("user_id")
        .eq("project_id", projectId);

      if (favorites && favorites.length > 0 && project) {
        const usersToNotify = favorites.slice(0, 50);
        
        for (const fav of usersToNotify) {
          if (fav.user_id === user.id) continue;

          try {
            await supabase.functions.invoke("send-application-notification", {
              body: {
                type: "favorite_project_update",
                recipientId: fav.user_id,
                projectId,
                projectTitle: project.title,
                updateContent: content.substring(0, 200),
                locale: localStorage.getItem("language") || "pt",
              },
            });
          } catch (notifError) {
            console.error("Failed to send favorite notification:", notifError);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-updates", projectId] });
      toast.success(i18n.t("projectUpdates.publishSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("projectUpdates.publishError"));
    },
  });

  // Delete update
  const deleteUpdate = useMutation({
    mutationFn: async (updateId: string) => {
      const { error } = await supabase
        .from("project_updates")
        .delete()
        .eq("id", updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-updates", projectId] });
      toast.success(i18n.t("projectUpdates.removeSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("projectUpdates.removeError"));
    },
  });

  return {
    updates,
    isLoading,
    addUpdate,
    deleteUpdate,
  };
};

export const getUpdateIcon = (type: UpdateType): string => {
  const icons: Record<UpdateType, string> = {
    MILESTONE: "🎯",
    ANNOUNCEMENT: "📢",
    HIRING: "👥",
    GENERAL: "📝",
    CREATED: "🚀",
    SHOWCASE_REQUESTED: "🌐",
    SHOWCASE_APPROVED: "✅",
    SHOWCASE_REJECTED: "❌",
  };
  return icons[type];
};

export const getUpdateLabel = (type: UpdateType): string => {
  const labels: Record<UpdateType, string> = {
    MILESTONE: "Marco",
    ANNOUNCEMENT: "Anúncio",
    HIRING: "Contratação",
    GENERAL: "Geral",
    CREATED: "Projeto Criado",
    SHOWCASE_REQUESTED: "Publicação Solicitada",
    SHOWCASE_APPROVED: "Publicação Aprovada",
    SHOWCASE_REJECTED: "Publicação Rejeitada",
  };
  return labels[type];
};
