import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export type LinkType = "GITHUB" | "WEBSITE" | "PITCH" | "LINKEDIN" | "TWITTER" | "FIGMA" | "OTHER";

export interface ProjectLink {
  id: string;
  project_id: string;
  type: LinkType;
  url: string;
  label: string | null;
  created_at: string;
}

export const useProjectLinks = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Fetch links for a project
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["project-links", projectId],
    queryFn: async (): Promise<ProjectLink[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("project_links")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");

      if (error) {
        console.error("Error fetching project links:", error);
        return [];
      }

      return (data || []) as ProjectLink[];
    },
    enabled: !!projectId,
  });

  // Add link
  const addLink = useMutation({
    mutationFn: async ({ projectId, type, url, label }: { projectId: string; type: LinkType; url: string; label?: string }) => {
      const { error } = await supabase
        .from("project_links")
        .insert({ project_id: projectId, type, url, label: label || null });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-links", projectId] });
      toast.success(i18n.t("projectLinks.addSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("projectLinks.addError"));
    },
  });

  // Update link
  const updateLink = useMutation({
    mutationFn: async ({ linkId, type, url, label }: { linkId: string; type: LinkType; url: string; label?: string }) => {
      const { error } = await supabase
        .from("project_links")
        .update({ type, url, label: label || null })
        .eq("id", linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-links", projectId] });
      toast.success(i18n.t("projectLinks.updateSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("projectLinks.updateError"));
    },
  });

  // Remove link
  const removeLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("project_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-links", projectId] });
      toast.success(i18n.t("projectLinks.removeSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("projectLinks.removeError"));
    },
  });

  return {
    links,
    isLoading,
    addLink,
    updateLink,
    removeLink,
  };
};

export const getLinkIcon = (type: LinkType): string => {
  const icons: Record<LinkType, string> = {
    GITHUB: "🐙",
    WEBSITE: "🌐",
    PITCH: "📊",
    LINKEDIN: "💼",
    TWITTER: "🐦",
    FIGMA: "🎨",
    OTHER: "🔗",
  };
  return icons[type];
};

export const getLinkLabel = (type: LinkType): string => {
  const labels: Record<LinkType, string> = {
    GITHUB: "GitHub",
    WEBSITE: "Website",
    PITCH: "Pitch Deck",
    LINKEDIN: "LinkedIn",
    TWITTER: "Twitter/X",
    FIGMA: "Figma",
    OTHER: "Outro",
  };
  return labels[type];
};
