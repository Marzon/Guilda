import { useQuery } from "@tanstack/react-query";

interface ProjectOwner {
  username: string;
  avatar_url: string | null;
}

interface ShowcaseProject {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  stage: string | null;
  created_at: string;
  owner: ProjectOwner | null;
}

export interface Job {
  id: string;
  role_name: string;
  role_description: string | null;
  required_archetype: "BUILDER" | "SELLER" | null;
  required_skills: string[] | null;
  created_at: string;
  project: {
    id: string;
    title: string;
    description: string | null;
    cover_image_url: string | null;
    owner: ProjectOwner | null;
  };
}

interface PlatformStats {
  total_profiles: number;
  total_projects: number;
  total_matches: number;
  total_open_jobs: number;
  showcase_projects_count: number;
  archetype_distribution: {
    builders: number;
    sellers: number;
    investors: number;
  };
  showcase_projects: ShowcaseProject[];
  open_jobs: Job[];
  cached_at: string;
}

const CORE_API_URL = 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1';

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      const response = await fetch(`${CORE_API_URL}/public-stats`);
      if (!response.ok) {
        console.error("Failed to fetch platform stats:", response.status);
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
};

// Hook específico para projetos showcase
export const useShowcaseProjects = () => {
  const { data, ...rest } = usePlatformStats();
  return {
    projects: data?.showcase_projects || [],
    count: data?.showcase_projects_count || 0,
    ...rest
  };
};

// Hook específico para vagas abertas
export const useOpenJobs = () => {
  const { data, ...rest } = usePlatformStats();
  return {
    jobs: data?.open_jobs || [],
    count: data?.total_open_jobs || 0,
    ...rest
  };
};
