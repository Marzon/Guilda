import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AccelerationOverview {
  total_founders: number;
  active: number;
  stuck: number;
  died: number;
  completed: number;
  pending: number;
  survival_rate: number;
  completion_rate: number;
}

export interface DayDistribution {
  day: number;
  count: number;
}

export interface SubmissionStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  approval_rate: number;
  avg_attempts_per_task: number;
}

export interface DailyActivity {
  date: string;
  submissions: number;
}

export interface TopPerformer {
  user_id: string;
  username: string;
  avatar_url: string | null;
  current_day: number;
  status: string;
  submissions_count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface AccelerationAnalytics {
  overview: AccelerationOverview;
  day_distribution: DayDistribution[];
  submission_stats: SubmissionStats;
  daily_activity: DailyActivity[];
  top_performers: TopPerformer[];
  status_distribution: StatusDistribution[];
}

export const useAccelerationAnalytics = (cohortId?: string | null) => {
  return useQuery({
    queryKey: ['acceleration-analytics', cohortId],
    queryFn: async (): Promise<AccelerationAnalytics> => {
      const { data, error } = await supabase.rpc('get_acceleration_analytics', {
        p_cohort_id: cohortId || null
      });

      if (error) {
        console.error("Error fetching acceleration analytics:", error);
        throw error;
      }

      // Parse the JSONB result - cast to unknown first for safety
      const result = data as unknown as AccelerationAnalytics | null;
      
      return {
        overview: result?.overview || {
          total_founders: 0,
          active: 0,
          stuck: 0,
          died: 0,
          completed: 0,
          pending: 0,
          survival_rate: 0,
          completion_rate: 0,
        },
        day_distribution: result?.day_distribution || [],
        submission_stats: result?.submission_stats || {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          approval_rate: 0,
          avg_attempts_per_task: 0,
        },
        daily_activity: result?.daily_activity || [],
        top_performers: result?.top_performers || [],
        status_distribution: result?.status_distribution || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    enabled: true,
  });
};