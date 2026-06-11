import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectTag {
  tag_id: string;
  tags: {
    id: string;
    name: string;
    color: string | null;
  };
}

interface ProjectRole {
  id: string;
  role_name: string;
  role_description: string | null;
  is_filled: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: "IDEA" | "MVP" | "SCALE";
  owner_id: string;
  created_at: string;
  owner: {
    username: string;
    avatar_url: string | null;
  } | null;
  project_tags?: ProjectTag[];
  project_roles?: ProjectRole[];
}

export const useProjects = (limit: number = 6) => {
  return useQuery({
    queryKey: ["projects", limit],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(username, avatar_url),
          project_tags(tag_id, tags(id, name, color)),
          project_roles(id, role_name, role_description, is_filled)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Failed to load projects:", error);
        return [];
      }

      // Normalize owner data - Supabase sometimes returns as array for joins
      return (data || []).map(project => ({
        ...project,
        owner: Array.isArray(project.owner) ? project.owner[0] : project.owner
      })) as Project[];
    },
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000,
  });
};
