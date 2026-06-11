import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export interface CohortVideo {
  id: string;
  cohort_id: string;
  day_number: number;
  title: string;
  video_url: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CohortVideoView {
  id: string;
  video_id: string;
  user_id: string;
  watched_at: string;
  watch_duration_seconds: number | null;
  completed: boolean;
}

// Hook for batch managers to manage videos
export function useCohortVideos(cohortId: string | null) {
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["cohort-videos", cohortId],
    enabled: !!cohortId,
    queryFn: async () => {
      if (!cohortId) return [];

      const { data, error } = await supabase
        .from("cohort_videos")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("day_number", { ascending: true });

      if (error) throw error;
      return data as CohortVideo[];
    },
  });

  const upsertVideo = useMutation({
    mutationFn: async ({
      cohortId,
      dayNumber,
      title,
      videoUrl,
      description,
    }: {
      cohortId: string;
      dayNumber: number;
      title: string;
      videoUrl: string;
      description?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("cohort_videos")
        .upsert(
          {
            cohort_id: cohortId,
            day_number: dayNumber,
            title,
            video_url: videoUrl,
            description: description || null,
            created_by: userData.user.id,
          },
          { onConflict: "cohort_id,day_number" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-videos"] });
      toast.success(i18n.t("admin.videos.saveSuccess", "Vídeo salvo com sucesso!"));
    },
    onError: (error: Error) => {
      toast.error(i18n.t("admin.videos.saveError", "Erro ao salvar vídeo: ") + error.message);
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("cohort_videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-videos"] });
      toast.success(i18n.t("admin.videos.deleteSuccess", "Vídeo removido!"));
    },
    onError: (error: Error) => {
      toast.error(i18n.t("admin.videos.deleteError", "Erro ao remover vídeo: ") + error.message);
    },
  });

  // Get video for a specific day
  const getVideoForDay = (dayNumber: number) => {
    return videos.find((v) => v.day_number === dayNumber) || null;
  };

  return {
    videos,
    isLoading,
    upsertVideo,
    deleteVideo,
    getVideoForDay,
  };
}

// Hook for founders to watch videos and track views
export function useFounderVideos(userId: string | null, cohortId: string | null) {
  const queryClient = useQueryClient();

  // Get all videos for the cohort
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["cohort-videos", cohortId],
    enabled: !!cohortId,
    queryFn: async () => {
      if (!cohortId) return [];

      const { data, error } = await supabase
        .from("cohort_videos")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("day_number", { ascending: true });

      if (error) throw error;
      return data as CohortVideo[];
    },
  });

  // Get user's video views
  const { data: views = [], isLoading: viewsLoading } = useQuery({
    queryKey: ["cohort-video-views", userId, cohortId],
    enabled: !!userId && !!cohortId && videos.length > 0,
    queryFn: async () => {
      if (!userId || videos.length === 0) return [];

      const videoIds = videos.map((v) => v.id);
      const { data, error } = await supabase
        .from("cohort_video_views")
        .select("*")
        .eq("user_id", userId)
        .in("video_id", videoIds);

      if (error) throw error;
      return data as CohortVideoView[];
    },
  });

  // Mark video as watched
  const markWatched = useMutation({
    mutationFn: async ({
      videoId,
      completed = false,
      durationSeconds,
    }: {
      videoId: string;
      completed?: boolean;
      durationSeconds?: number;
    }) => {
      if (!userId) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("cohort_video_views")
        .upsert(
          {
            video_id: videoId,
            user_id: userId,
            completed,
            watch_duration_seconds: durationSeconds || null,
          },
          { onConflict: "video_id,user_id" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-video-views", userId, cohortId] });
    },
  });

  // Check if user has watched a video
  const hasWatchedVideo = (videoId: string) => {
    return views.some((v) => v.video_id === videoId);
  };

  // Check if user needs to see a video for a day (not watched yet)
  const getUnwatchedVideoForDay = (dayNumber: number) => {
    const video = videos.find((v) => v.day_number === dayNumber);
    if (!video) return null;
    if (hasWatchedVideo(video.id)) return null;
    return video;
  };

  // Get video for a specific day (regardless of watched status)
  const getVideoForDay = (dayNumber: number) => {
    return videos.find((v) => v.day_number === dayNumber) || null;
  };

  return {
    videos,
    views,
    isLoading: videosLoading || viewsLoading,
    markWatched,
    hasWatchedVideo,
    getUnwatchedVideoForDay,
    getVideoForDay,
  };
}
