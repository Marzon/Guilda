import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export interface FavoriteProjectRole {
  id: string;
  role_name: string;
  role_description: string | null;
  is_filled: boolean;
}

export interface FavoriteProject {
  id: string;
  project_id: string;
  created_at: string;
  project?: {
    id: string;
    title: string;
    description: string | null;
    status: "IDEA" | "MVP" | "SCALE";
    cover_image_url?: string | null;
    owner: {
      username: string;
      avatar_url: string | null;
    };
    project_roles?: FavoriteProjectRole[];
  };
}

export const useProjectFavorites = () => {
  const queryClient = useQueryClient();

  // Fetch user's favorite projects
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["project-favorites"],
    queryFn: async (): Promise<FavoriteProject[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("project_favorites")
        .select(`
          *,
          project:projects!project_favorites_project_id_fkey(
            id, title, description, status, cover_image_url,
            owner:profiles!projects_owner_id_fkey(username, avatar_url),
            project_roles(id, role_name, role_description, is_filled)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }

      return (data || []) as unknown as FavoriteProject[];
    },
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (projectId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isFavorited = favorites.some(f => f.project_id === projectId);

      if (isFavorited) {
        const { error } = await supabase
          .from("project_favorites")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", user.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("project_favorites")
          .insert({ project_id: projectId, user_id: user.id });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["project-favorites"] });
      toast.success(result.action === "added" ? i18n.t("projectFavorites.addSuccess") : i18n.t("projectFavorites.removeSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("projectFavorites.error"));
    },
  });

  // Check if project is favorited
  const isFavorited = (projectId: string) => {
    return favorites.some(f => f.project_id === projectId);
  };

  // Get favorites count for a project
  const useFavoritesCount = (projectId: string) => {
    return useQuery({
      queryKey: ["favorites-count", projectId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("project_favorites")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId);

        if (error) return 0;
        return count || 0;
      },
    });
  };

  return {
    favorites,
    favoriteProjects: favorites.map(f => f.project).filter(Boolean),
    isLoading,
    toggleFavorite,
    isFavorited,
    useFavoritesCount,
  };
};
