import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Skill {
  id: string;
  name: string;
  category: 'tech' | 'design' | 'business' | 'investor';
  icon: string | null;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: number;
  skill?: Skill;
}

export const useSkills = () => {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("category")
        .order("name");

      if (error) throw error;
      return data as Skill[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - skills rarely change
  });
};

export const useUserSkills = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-skills", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_skills")
        .select(`
          id,
          user_id,
          skill_id,
          proficiency_level,
          skills (
            id,
            name,
            category,
            icon
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        skill: item.skills as unknown as Skill
      })) as UserSkill[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBatchUserSkills = (userIds: string[]) => {
  return useQuery({
    queryKey: ["batch-user-skills", userIds.sort().join(",")],
    queryFn: async () => {
      if (!userIds.length) return {};
      
      const { data, error } = await supabase
        .from("user_skills")
        .select(`
          id,
          user_id,
          skill_id,
          proficiency_level,
          skills (
            id,
            name,
            category,
            icon
          )
        `)
        .in("user_id", userIds);

      if (error) throw error;
      
      // Group by user_id
      const grouped: Record<string, UserSkill[]> = {};
      data.forEach(item => {
        if (!grouped[item.user_id]) {
          grouped[item.user_id] = [];
        }
        grouped[item.user_id].push({
          ...item,
          skill: item.skills as unknown as Skill
        });
      });
      
      return grouped;
    },
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};
