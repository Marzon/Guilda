import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ProjectComment {
  id: string;
  project_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string | null;
    archetype: "BUILDER" | "SELLER";
  };
  replies?: ProjectComment[];
}

export const useProjectComments = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["project-comments", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_comments")
        .select(`
          *,
          author:profiles!project_comments_author_id_fkey(
            id,
            username,
            avatar_url,
            archetype
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const rootComments: ProjectComment[] = [];
      const commentMap = new Map<string, ProjectComment>();

      // First pass: create map of all comments
      (data || []).forEach((comment: any) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree structure
      commentMap.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      return rootComments;
    },
    enabled: !!projectId,
    staleTime: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-comments-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_comments",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project-comments", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("project_comments")
        .insert({
          project_id: projectId,
          author_id: user.id,
          parent_id: parentId || null,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger notification for project owner or parent comment author
      try {
        await supabase.functions.invoke("create-notification", {
          body: {
            projectId,
            commentId: data.id,
            parentId,
            type: "project_comment",
          },
        });
      } catch (e) {
        console.error("Failed to send notification:", e);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-comments", projectId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("project_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-comments", projectId] });
    },
  });

  const totalCommentsCount = comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    totalCommentsCount,
  };
};
