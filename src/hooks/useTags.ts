import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ProjectTag {
  id: string;
  project_id: string;
  tag_id: string;
  tag?: Tag;
}

export const useTags = () => {
  const queryClient = useQueryClient();

  // Fetch all available tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching tags:", error);
        return [];
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { tags, isLoading };
};

export const useProjectTags = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Fetch tags for a specific project
  const { data: projectTags = [], isLoading } = useQuery({
    queryKey: ["project-tags", projectId],
    queryFn: async (): Promise<ProjectTag[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("project_tags")
        .select(`
          *,
          tag:tags!project_tags_tag_id_fkey(id, name, color)
        `)
        .eq("project_id", projectId);

      if (error) {
        console.error("Error fetching project tags:", error);
        return [];
      }

      return (data || []) as unknown as ProjectTag[];
    },
    enabled: !!projectId,
  });

  // Add tag to project
  const addTag = useMutation({
    mutationFn: async ({ projectId, tagId }: { projectId: string; tagId: string }) => {
      const { error } = await supabase
        .from("project_tags")
        .insert({ project_id: projectId, tag_id: tagId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tags", projectId] });
    },
  });

  // Remove tag from project
  const removeTag = useMutation({
    mutationFn: async ({ projectId, tagId }: { projectId: string; tagId: string }) => {
      const { error } = await supabase
        .from("project_tags")
        .delete()
        .eq("project_id", projectId)
        .eq("tag_id", tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tags", projectId] });
    },
  });

  // Set multiple tags at once
  const setTags = useMutation({
    mutationFn: async ({ projectId, tagIds }: { projectId: string; tagIds: string[] }) => {
      // Remove all existing tags
      await supabase
        .from("project_tags")
        .delete()
        .eq("project_id", projectId);

      // Add new tags
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from("project_tags")
          .insert(tagIds.map(tagId => ({ project_id: projectId, tag_id: tagId })));

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tags", projectId] });
    },
  });

  return {
    projectTags,
    tags: projectTags.map(pt => pt.tag).filter(Boolean) as Tag[],
    isLoading,
    addTag,
    removeTag,
    setTags,
  };
};
