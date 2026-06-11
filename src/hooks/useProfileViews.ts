import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfileViews(userId: string | null) {
  const queryClient = useQueryClient();
  const [hideViewed, setHideViewed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tavern-hide-viewed') === 'true';
    }
    return false;
  });

  // Persist toggle preference
  useEffect(() => {
    localStorage.setItem('tavern-hide-viewed', hideViewed.toString());
  }, [hideViewed]);

  // Fetch viewed profile IDs
  const { data: viewedProfileIds = [], isLoading } = useQuery({
    queryKey: ["profile-views", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("profile_views")
        .select("viewed_profile_id")
        .eq("viewer_id", userId);
      
      if (error) throw error;
      return data.map(v => v.viewed_profile_id);
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Mark profile as viewed
  const markAsViewedMutation = useMutation({
    mutationFn: async (viewedProfileId: string) => {
      if (!userId) throw new Error("No user");
      
      const { error } = await supabase
        .from("profile_views")
        .upsert({
          viewer_id: userId,
          viewed_profile_id: viewedProfileId,
        }, { ignoreDuplicates: true });
      
      if (error) throw error;
    },
    onSuccess: (_, viewedProfileId) => {
      // Optimistic update
      queryClient.setQueryData<string[]>(["profile-views", userId], (old = []) => {
        if (old.includes(viewedProfileId)) return old;
        return [...old, viewedProfileId];
      });
    },
  });

  // Clear all viewed profiles
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user");
      
      const { error } = await supabase
        .from("profile_views")
        .delete()
        .eq("viewer_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(["profile-views", userId], []);
    },
  });

  const markAsViewed = useCallback((profileId: string) => {
    if (!userId || viewedProfileIds.includes(profileId)) return;
    markAsViewedMutation.mutate(profileId);
  }, [userId, viewedProfileIds, markAsViewedMutation]);

  const clearHistory = useCallback(() => {
    clearHistoryMutation.mutate();
  }, [clearHistoryMutation]);

  const isViewed = useCallback((profileId: string) => {
    return viewedProfileIds.includes(profileId);
  }, [viewedProfileIds]);

  return {
    viewedProfileIds,
    viewedCount: viewedProfileIds.length,
    hideViewed,
    setHideViewed,
    markAsViewed,
    clearHistory,
    isViewed,
    isLoading,
    isClearing: clearHistoryMutation.isPending,
  };
}
