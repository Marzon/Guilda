import { useQuery } from "@tanstack/react-query";
import { CORE_API } from "@/lib/api-config";

interface ProjectOwner {
  username: string;
  avatar_url: string | null;
  archetype?: string;
}

export interface StartupWithRoles {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  status: "IDEA" | "MVP" | "SCALE" | null;
  created_at: string;
  owner: ProjectOwner | null;
  roles: Role[];
}

export interface Role {
  id: string;
  role_name: string;
  role_description: string | null;
  required_archetype: "BUILDER" | "SELLER" | "INVESTOR" | null;
  required_skills: string[] | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

const CORE_PUBLIC_STATS_URL = 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/public-stats';

export function useStartupsWithRoles(limit: number = 50) {
  return useQuery({
    queryKey: ["startups-with-roles", limit],
    queryFn: async (): Promise<StartupWithRoles[]> => {
      // Fetch both endpoints in parallel
      const [statsRes, jobsRes] = await Promise.all([
        fetch(CORE_PUBLIC_STATS_URL),
        fetch(CORE_API.buildUrl("jobs", { limit: 200 }), {
          headers: CORE_API.getHeaders(),
        }),
      ]);

      const statsData = statsRes.ok ? await statsRes.json() : { showcase_projects: [] };
      const jobsData = jobsRes.ok ? await jobsRes.json() : { data: [] };

      // Build a map: project_id -> roles[]
      const projectRolesMap = new Map<string, { project: any; roles: Role[] }>();
      
      for (const job of jobsData.data || []) {
        const pid = job.project?.id;
        if (!pid) continue;
        
        if (!projectRolesMap.has(pid)) {
          projectRolesMap.set(pid, { project: job.project, roles: [] });
        }
        projectRolesMap.get(pid)!.roles.push({
          id: job.id,
          role_name: job.role_name,
          role_description: job.role_description,
          required_archetype: job.required_archetype,
          required_skills: job.required_skills,
        });
      }

      // Build showcase projects map for extra data
      const showcaseMap = new Map<string, any>();
      for (const p of statsData.showcase_projects || []) {
        showcaseMap.set(p.id, p);
      }

      // Merge: projects that have description AND roles
      const result: StartupWithRoles[] = [];
      const seenIds = new Set<string>();
      const seenSlugs = new Set<string>();

      // First: projects from jobs that have description
      for (const [pid, entry] of projectRolesMap) {
        const proj = entry.project;
        const desc = proj.description?.trim();
        if (!desc) continue;
        
        seenIds.add(pid);
        const showcase = showcaseMap.get(pid);
        
        let slug = slugify(proj.title);
        if (seenSlugs.has(slug)) slug = `${slug}-${pid.substring(0, 6)}`;
        seenSlugs.add(slug);

        result.push({
          id: pid,
          title: proj.title?.trim(),
          slug,
          description: desc,
          cover_image_url: proj.cover_image_url || showcase?.cover_image_url || null,
          status: showcase?.status || proj.status || null,
          created_at: showcase?.created_at || entry.roles[0]?.id || new Date().toISOString(),
          owner: proj.owner ? {
            username: proj.owner.username,
            avatar_url: proj.owner.avatar_url,
            archetype: proj.owner.archetype,
          } : null,
          roles: entry.roles,
        });
      }

      // Sort by most recent first
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return result.slice(0, limit);
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useStartupBySlug(slug: string | undefined) {
  const { data: startups, isLoading, error } = useStartupsWithRoles(100);
  
  const startup = startups?.find(s => s.slug === slug) || null;
  
  return { startup, isLoading, error };
}
