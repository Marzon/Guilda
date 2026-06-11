import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { blogArticles } from "@/data/blog-articles";
import { getAllFAQQuestions } from "@/data/faq-data";

export interface GlobalSearchResult {
  type: 'job' | 'project' | 'profile' | 'tool' | 'blog' | 'faq';
  id: string;
  title: string;
  subtitle?: string;
  path: string;
  image?: string;
}

export interface ProfileSearchResult extends GlobalSearchResult {
  type: 'profile';
  username: string;
  archetype: string;
  bio: string | null;
  stats: any;
  xp_level: number;
  matchedSkill?: { name: string; category: string };
}

export interface JobSearchResult extends GlobalSearchResult {
  type: 'job';
  projectId: string;
  projectTitle: string;
  roleDescription?: string;
  ownerUsername?: string;
  ownerAvatar?: string;
}

interface GroupedResults {
  profiles: ProfileSearchResult[];
  projects: GlobalSearchResult[];
  jobs: GlobalSearchResult[];
  tools: GlobalSearchResult[];
  blog: GlobalSearchResult[];
  faq: GlobalSearchResult[];
}

// Tool IDs for search
const TOOL_IDS = [
  'cold-outreach', 'markup-calculator', 'card-fee-simulator', 'business-health-quiz', 'breakeven-calculator',
  'roi-calculator', 'proposal-generator', 'company-opening-checklist', 'equity-calculator',
  'valuation-calculator', 'contract-generator', 'runway-calculator', 'unit-economics',
  'cap-table', 'burn-rate-optimizer', 'archetype-quiz', 'business-model', 'tam-sam-som',
  'empathy-map', 'swot', 'customer-dev', 'lgpd-guide', 'recruiting-guide', 'dataroom-guide',
  'mvp-vibecoding', 'knowledge-roadmap', 'guilda-ia-mvp'
];

export function useGlobalSearch(query: string) {
  const { t, currentLanguage } = useLanguage();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.toLowerCase().trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  const isEnabled = debouncedQuery.length >= 2;
  
  // Fetch from Supabase
  const { data: supabaseResults, isLoading } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: async () => {
      const [profilesRes, projectsRes, jobsRes, profilesBySkillRes] = await Promise.all([
        // Founders by username/bio
        supabase
          .from("profiles")
          .select("id, username, avatar_url, archetype, bio, stats, xp_level")
          .or(`username.ilike.%${debouncedQuery}%,bio.ilike.%${debouncedQuery}%`)
          .limit(5),
        // Startups
        supabase
          .from("projects")
          .select("id, title, cover_image_url, description")
          .or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
          .limit(5),
        // Jobs (project roles)
        supabase
          .from("project_roles")
          .select("id, role_name, role_description, is_filled, projects(id, title, cover_image_url, profiles:owner_id(username, avatar_url))")
          .eq("is_filled", false)
          .ilike("role_name", `%${debouncedQuery}%`)
          .limit(5),
        // Founders by skills
        supabase
          .from("user_skills")
          .select(`
            user_id,
            skills!inner(name, category),
            profiles!inner(id, username, avatar_url, archetype, bio, stats, xp_level)
          `)
          .ilike("skills.name", `%${debouncedQuery}%`)
          .limit(10),
      ]);
      
      return {
        profiles: profilesRes.data || [],
        profilesBySkill: profilesBySkillRes.data || [],
        projects: projectsRes.data || [],
        jobs: jobsRes.data || [],
      };
    },
    enabled: isEnabled,
    staleTime: 30000,
  });
  
  // Search tools (static data with i18n)
  const toolResults = useMemo((): GlobalSearchResult[] => {
    if (!isEnabled) return [];
    
    return TOOL_IDS.filter(toolId => {
      const title = t(`tools.${toolId}.title`, "").toLowerCase();
      const description = t(`tools.${toolId}.description`, "").toLowerCase();
      return title.includes(debouncedQuery) || description.includes(debouncedQuery);
    }).slice(0, 5).map(toolId => ({
      type: 'tool' as const,
      id: toolId,
      title: t(`tools.${toolId}.title`, toolId),
      subtitle: t(`tools.${toolId}.shortDesc`, ""),
      path: `/tools/${toolId}`,
    }));
  }, [debouncedQuery, isEnabled, t]);
  
  // Search blog articles
  const blogResults = useMemo((): GlobalSearchResult[] => {
    if (!isEnabled) return [];
    
    const lang = currentLanguage as 'pt' | 'en' | 'es';
    
    return blogArticles.filter(article => {
      const title = article.title[lang].toLowerCase();
      const excerpt = article.excerpt[lang].toLowerCase();
      return title.includes(debouncedQuery) || excerpt.includes(debouncedQuery);
    }).slice(0, 5).map(article => ({
      type: 'blog' as const,
      id: article.slug,
      title: article.title[lang as 'pt' | 'en' | 'es'],
      subtitle: article.author,
      path: `/blog/${article.slug}`,
      image: article.coverImage,
    }));
  }, [debouncedQuery, isEnabled, currentLanguage]);

  // Search FAQ questions
  const faqResults = useMemo((): GlobalSearchResult[] => {
    if (!isEnabled) return [];
    
    const lang = currentLanguage as 'pt' | 'en' | 'es';
    const allQuestions = getAllFAQQuestions();
    
    return allQuestions.filter(q => {
      const question = q.question[lang].toLowerCase();
      const answer = q.answer[lang].toLowerCase();
      return question.includes(debouncedQuery) || answer.includes(debouncedQuery);
    }).slice(0, 5).map(q => ({
      type: 'faq' as const,
      id: q.id,
      title: q.question[lang],
      subtitle: q.answer[lang].slice(0, 60) + '...',
      path: `/faq?section=${q.sectionId}&q=${q.id}`,
    }));
  }, [debouncedQuery, isEnabled, currentLanguage]);
  
  // Format Supabase results
  const groupedResults = useMemo((): GroupedResults => {
    // Direct profile matches
    const directProfiles: ProfileSearchResult[] = (supabaseResults?.profiles || []).map(p => ({
      type: 'profile' as const,
      id: p.id,
      title: p.username,
      subtitle: t(`archetype.${p.archetype}`, p.archetype),
      path: `/u/${p.username}`,
      image: p.avatar_url || undefined,
      username: p.username,
      archetype: p.archetype,
      bio: p.bio,
      stats: p.stats,
      xp_level: p.xp_level || 1,
    }));
    
    // Skill-matched profiles
    const skillProfiles: ProfileSearchResult[] = (supabaseResults?.profilesBySkill || []).map((item: any) => ({
      type: 'profile' as const,
      id: item.profiles.id,
      title: item.profiles.username,
      subtitle: String(t(`archetype.${item.profiles.archetype}`, item.profiles.archetype)),
      path: `/u/${item.profiles.username}`,
      image: item.profiles.avatar_url || undefined,
      username: item.profiles.username,
      archetype: item.profiles.archetype,
      bio: item.profiles.bio,
      stats: item.profiles.stats,
      xp_level: item.profiles.xp_level || 1,
      matchedSkill: { name: item.skills.name, category: item.skills.category },
    }));
    
    // Merge and deduplicate (direct matches take priority)
    const seenIds = new Set(directProfiles.map(p => p.id));
    const mergedProfiles = [...directProfiles];
    skillProfiles.forEach(sp => {
      if (!seenIds.has(sp.id)) {
        seenIds.add(sp.id);
        mergedProfiles.push(sp);
      }
    });
    
    const profiles = mergedProfiles.slice(0, 8);
    
    const projects: GlobalSearchResult[] = (supabaseResults?.projects || []).map(p => ({
      type: 'project' as const,
      id: p.id,
      title: p.title,
      subtitle: p.description?.slice(0, 50) || "",
      path: `/project/${p.id}`,
      image: p.cover_image_url || undefined,
    }));
    
    const jobs: JobSearchResult[] = (supabaseResults?.jobs || []).map(j => ({
      type: 'job' as const,
      id: j.id,
      title: j.role_name,
      subtitle: j.projects?.title || "",
      path: `/project/${j.projects?.id}`,
      image: j.projects?.cover_image_url || undefined,
      projectId: j.projects?.id || "",
      projectTitle: j.projects?.title || "",
      roleDescription: j.role_description || undefined,
      ownerUsername: (j.projects as any)?.profiles?.username || undefined,
      ownerAvatar: (j.projects as any)?.profiles?.avatar_url || undefined,
    }));
    
    return {
      profiles,
      projects,
      jobs,
      tools: toolResults,
      blog: blogResults,
      faq: faqResults,
    };
  }, [supabaseResults, toolResults, blogResults, faqResults, t]);
  
  const totalResults = 
    groupedResults.profiles.length +
    groupedResults.projects.length +
    groupedResults.jobs.length +
    groupedResults.tools.length +
    groupedResults.blog.length +
    groupedResults.faq.length;
  
  return {
    groupedResults,
    isLoading,
    totalResults,
    hasResults: totalResults > 0,
    isEnabled,
  };
}
