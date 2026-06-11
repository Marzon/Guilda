import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useProjectViewTracking = () => {
  const authQuery = useAuth();
  const user = authQuery.data?.user;
  const queryClient = useQueryClient();

  // Fetch all viewed project IDs for current user
  const { data: viewedProjectIds = [], isLoading } = useQuery({
    queryKey: ["project-views", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("project_views")
        .select("project_id")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching project views:", error);
        return [];
      }
      
      return data.map((v) => v.project_id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mark a project as viewed
  const markAsViewed = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from("project_views")
        .upsert(
          { user_id: user.id, project_id: projectId, viewed_at: new Date().toISOString() },
          { onConflict: "user_id,project_id" }
        );
      
      if (error) {
        console.error("Error marking project as viewed:", error);
        throw error;
      }
    },
    onSuccess: (_, projectId) => {
      // Optimistically update the cache
      queryClient.setQueryData<string[]>(["project-views", user?.id], (old = []) => {
        if (old.includes(projectId)) return old;
        return [...old, projectId];
      });
    },
  });

  const isViewed = (projectId: string) => viewedProjectIds.includes(projectId);

  return {
    viewedProjectIds,
    isLoading,
    isViewed,
    markAsViewed: markAsViewed.mutate,
  };
};
