import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export interface SuccessStory {
  id: string;
  match_id: string | null;
  application_id: string | null;
  founder_1_id: string;
  founder_2_id: string;
  project_id: string | null;
  partnership_type: 'cofounder' | 'contractor' | 'advisor' | 'investor' | 'other' | null;
  testimonial_1: string | null;
  testimonial_2: string | null;
  result_summary: string | null;
  confirmed_by_founder_1: boolean;
  confirmed_by_founder_2: boolean;
  confirmation_token_1: string | null;
  confirmation_token_2: string | null;
  status: 'pending' | 'partial' | 'confirmed' | 'featured' | 'rejected';
  is_public: boolean;
  featured_order: number | null;
  created_at: string;
  confirmed_at: string | null;
  follow_up_sent_at: string | null;
  created_by: string | null;
  // Joined data
  founder_1?: {
    id: string;
    username: string;
    avatar_url: string | null;
    archetype: string;
  };
  founder_2?: {
    id: string;
    username: string;
    avatar_url: string | null;
    archetype: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export interface CreateSuccessStoryInput {
  founder_1_id: string;
  founder_2_id: string;
  project_id?: string;
  match_id?: string;
  application_id?: string;
  partnership_type?: SuccessStory['partnership_type'];
  result_summary?: string;
  status?: SuccessStory['status'];
  is_public?: boolean;
}

export interface UpdateSuccessStoryInput {
  id: string;
  partnership_type?: SuccessStory['partnership_type'];
  result_summary?: string;
  testimonial_1?: string;
  testimonial_2?: string;
  status?: SuccessStory['status'];
  is_public?: boolean;
  featured_order?: number | null;
  confirmed_by_founder_1?: boolean;
  confirmed_by_founder_2?: boolean;
  confirmed_at?: string;
}

export function useSuccessStories() {
  const queryClient = useQueryClient();

  // Fetch all success stories (admin)
  const { data: successStories = [], isLoading, refetch } = useQuery({
    queryKey: ["success-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select(`
          *,
          founder_1:profiles!success_stories_founder_1_id_fkey(id, username, avatar_url, archetype),
          founder_2:profiles!success_stories_founder_2_id_fkey(id, username, avatar_url, archetype),
          project:projects(id, title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as SuccessStory[];
    },
  });

  // Fetch all public stories (for dedicated page)
  const { data: publicStories = [], isLoading: isLoadingPublic } = useQuery({
    queryKey: ["success-stories-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select(`
          *,
          founder_1:profiles!success_stories_founder_1_id_fkey(id, username, avatar_url, archetype),
          founder_2:profiles!success_stories_founder_2_id_fkey(id, username, avatar_url, archetype),
          project:projects(id, title)
        `)
        .eq("is_public", true)
        .in("status", ["confirmed", "featured"])
        .order("confirmed_at", { ascending: false });

      if (error) throw error;
      return (data || []) as SuccessStory[];
    },
  });

  // Fetch featured stories (public)
  const { data: featuredStories = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["success-stories-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select(`
          *,
          founder_1:profiles!success_stories_founder_1_id_fkey(id, username, avatar_url, archetype),
          founder_2:profiles!success_stories_founder_2_id_fkey(id, username, avatar_url, archetype),
          project:projects(id, title)
        `)
        .eq("status", "featured")
        .eq("is_public", true)
        .order("featured_order", { ascending: true, nullsFirst: false })
        .limit(6);

      if (error) throw error;
      return (data || []) as SuccessStory[];
    },
  });

  // Create success story
  const createMutation = useMutation({
    mutationFn: async (input: CreateSuccessStoryInput) => {
      const { data, error } = await supabase
        .from("success_stories")
        .insert({
          ...input,
          status: input.status || 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-stories"] });
      toast.success(i18n.t("successStories.createSuccess"));
    },
    onError: (error) => {
      console.error("Error creating success story:", error);
      toast.error(i18n.t("successStories.createError"));
    },
  });

  // Update success story
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSuccessStoryInput) => {
      const { data, error } = await supabase
        .from("success_stories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-stories"] });
      queryClient.invalidateQueries({ queryKey: ["success-stories-featured"] });
      toast.success(i18n.t("successStories.updateSuccess"));
    },
    onError: (error) => {
      console.error("Error updating success story:", error);
      toast.error(i18n.t("successStories.updateError"));
    },
  });

  // Delete success story
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("success_stories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-stories"] });
      queryClient.invalidateQueries({ queryKey: ["success-stories-featured"] });
      toast.success(i18n.t("successStories.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting success story:", error);
      toast.error(i18n.t("successStories.deleteError"));
    },
  });

  // Stats
  const stats = {
    total: successStories.length,
    pending: successStories.filter(s => s.status === 'pending').length,
    partial: successStories.filter(s => s.status === 'partial').length,
    confirmed: successStories.filter(s => s.status === 'confirmed').length,
    featured: successStories.filter(s => s.status === 'featured').length,
    rejected: successStories.filter(s => s.status === 'rejected').length,
  };

  return {
    successStories,
    featuredStories,
    publicStories,
    stats,
    isLoading,
    isLoadingFeatured,
    isLoadingPublic,
    refetch,
    createSuccessStory: createMutation.mutate,
    updateSuccessStory: updateMutation.mutate,
    deleteSuccessStory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
