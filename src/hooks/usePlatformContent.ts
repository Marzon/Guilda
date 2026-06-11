import { useQuery } from "@tanstack/react-query";
import { CORE_API } from "@/lib/api-config";

// Types
interface ProjectOwner {
  username: string;
  avatar_url: string | null;
}

export interface Startup {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  status: "IDEA" | "MVP" | "SCALE" | null;
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

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    limit: number;
    offset: number;
  };
}

interface StatsResponse {
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
}

// Generic fetch function
async function fetchFromAPI<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  const url = CORE_API.buildUrl(endpoint, params);
  
  const response = await fetch(url, {
    headers: CORE_API.getHeaders(),
  });

  if (!response.ok) {
    console.error(`[API] Failed to fetch ${endpoint}:`, response.status);
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
}

// Core App public endpoint for startups data
const CORE_PUBLIC_STATS_URL = 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/public-stats';

// Hook for startups (showcase projects) - fetches from Core App public-stats
export function useStartups(options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["startups", options?.limit, options?.offset],
    queryFn: async (): Promise<PaginatedResponse<Startup>> => {
      try {
        const response = await fetch(CORE_PUBLIC_STATS_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const stats = await response.json();
        
        console.log('[useStartups] Raw data sample:', stats.showcase_projects?.[0]);
        
        // Map showcase_projects to Startup format
        const allProjects: Startup[] = (stats.showcase_projects || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          cover_image_url: p.cover_image_url || p.coverImageUrl || null,
          status: p.status || null,
          created_at: p.created_at,
          owner: p.owner ? {
            username: p.owner.username,
            avatar_url: p.owner.avatar_url
          } : null
        }));
        
        const limit = options?.limit || 12;
        const offset = options?.offset || 0;
        const paginatedProjects = allProjects.slice(offset, offset + limit);
        
        return {
          data: paginatedProjects,
          meta: {
            total_count: allProjects.length,
            limit,
            offset
          }
        };
      } catch (error) {
        console.error("[useStartups] Error fetching from Core:", error);
        return {
          data: [],
          meta: {
            total_count: 0,
            limit: options?.limit || 12,
            offset: options?.offset || 0
          }
        };
      }
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// Hook for jobs (open roles)
export function useJobs(options?: { limit?: number; offset?: number; archetype?: string }) {
  return useQuery({
    queryKey: ["jobs", options?.limit, options?.offset, options?.archetype],
    queryFn: () => fetchFromAPI<PaginatedResponse<Job>>("jobs", {
      limit: options?.limit || 12,
      offset: options?.offset || 0,
      ...(options?.archetype && { archetype: options.archetype }),
    }),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

// Hook for platform stats
export function useStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => fetchFromAPI<StatsResponse>("stats"),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}
