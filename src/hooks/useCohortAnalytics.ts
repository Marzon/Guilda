import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CohortEngagementMetrics {
  id: string;
  name: string;
  matches_30d: number;
  messages_30d: number;
  active_7d: number;
}

export interface MemberEvolution {
  month: string;
  cohort_name: string;
  new_members: number;
  cumulative_members: number | string;
}

export interface MemberEngagementRanking {
  user_id: string;
  username: string;
  cohort_name: string;
  matches: number;
  messages: number;
  is_active: number;
  engagement_score: number;
}

export interface AggregatedMetrics {
  totalMatches30d: number;
  totalMessages30d: number;
  activeUsers7d: number;
  engagementRate: number;
}

export const useCohortAnalytics = () => {
  const { data: engagementData, isLoading: loadingEngagement } = useQuery({
    queryKey: ["cohort-engagement"],
    queryFn: async (): Promise<CohortEngagementMetrics[]> => {
      const { data, error } = await supabase.rpc("get_cohort_engagement_metrics");
      
      if (error) {
        console.error("Failed to fetch cohort engagement:", error);
        return [];
      }
      
      return (data as CohortEngagementMetrics[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: evolutionData, isLoading: loadingEvolution } = useQuery({
    queryKey: ["cohort-evolution"],
    queryFn: async (): Promise<MemberEvolution[]> => {
      const { data, error } = await supabase.rpc("get_cohort_member_evolution");
      
      if (error) {
        console.error("Failed to fetch member evolution:", error);
        return [];
      }
      
      return (data as MemberEvolution[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: rankingData, isLoading: loadingRanking } = useQuery({
    queryKey: ["cohort-engagement-ranking"],
    queryFn: async (): Promise<MemberEngagementRanking[]> => {
      const { data, error } = await supabase.rpc("get_cohort_member_engagement_ranking");
      
      if (error) {
        console.error("Failed to fetch engagement ranking:", error);
        return [];
      }
      
      return (data as MemberEngagementRanking[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Calculate aggregated metrics
  const aggregatedMetrics: AggregatedMetrics = {
    totalMatches30d: engagementData?.reduce((acc, c) => acc + c.matches_30d, 0) || 0,
    totalMessages30d: engagementData?.reduce((acc, c) => acc + c.messages_30d, 0) || 0,
    activeUsers7d: engagementData?.reduce((acc, c) => acc + c.active_7d, 0) || 0,
    engagementRate: 0,
  };

  // Calculate engagement rate
  const totalMembers = engagementData?.length || 0;
  if (totalMembers > 0 && aggregatedMetrics.activeUsers7d > 0) {
    aggregatedMetrics.engagementRate = Math.round(
      (aggregatedMetrics.activeUsers7d / (aggregatedMetrics.activeUsers7d + 5)) * 100
    );
  }

  return {
    engagementByCohort: engagementData || [],
    memberEvolution: evolutionData || [],
    engagementRanking: rankingData || [],
    aggregatedMetrics,
    isLoading: loadingEngagement || loadingEvolution || loadingRanking,
  };
};
