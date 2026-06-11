import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserCohortData {
  cohort_id: string | null;
  member_status: string | null;
  cohort: {
    id: string;
    name: string;
    status: string;
    start_date: string;
    is_pilot: boolean;
  } | null;
}

export interface BatchManagerCohort {
  cohort_id: string;
  cohort: {
    id: string;
    name: string;
    status: string;
    start_date: string;
    is_pilot: boolean;
  };
}

export const useUserCohort = (userId: string | null) => {
  // Check regular enrollment
  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['user-cohort', userId],
    queryFn: async (): Promise<UserCohortData | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          cohort_id,
          member_status,
          cohort:cohorts(id, name, status, start_date, is_pilot)
        `)
        .eq('user_id', userId)
        .not('cohort_id', 'is', null)
        .in('member_status', ['ENROLLED', 'ACTIVE', 'GRADUATED'])
        .maybeSingle();
      
      if (error || !data) return null;
      
      return data as UserCohortData;
    },
    enabled: !!userId,
  });

  // Check if user is a batch manager of any cohort (get the first one for default)
  const { data: batchManagerData, isLoading: batchManagerLoading } = useQuery({
    queryKey: ['user-batch-manager-cohorts', userId],
    queryFn: async (): Promise<BatchManagerCohort | null> => {
      if (!userId) return null;
      
      // Get cohorts where user is a batch manager
      const { data, error } = await supabase
        .from('cohort_managers')
        .select(`
          cohort_id,
          cohort:cohorts(id, name, status, start_date, is_pilot)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error || !data) return null;
      
      return data as BatchManagerCohort;
    },
    enabled: !!userId && !enrollmentData?.cohort_id,
  });

  // Get ALL cohorts managed by this batch manager (for navigation)
  const { data: allManagedCohorts = [], isLoading: allManagedLoading } = useQuery({
    queryKey: ['user-batch-manager-all-cohorts', userId],
    queryFn: async (): Promise<BatchManagerCohort[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('cohort_managers')
        .select(`
          cohort_id,
          cohort:cohorts(id, name, status, start_date, is_pilot)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });
      
      if (error || !data) return [];
      return data as BatchManagerCohort[];
    },
    enabled: !!userId,
  });

  // Prioritize regular enrollment over batch manager access
  const isEnrolled = !!enrollmentData?.cohort_id;
  const isBatchManager = !isEnrolled && !!batchManagerData?.cohort_id;
  
  // Use enrollment data if enrolled, otherwise use batch manager cohort
  const cohortData = isEnrolled ? enrollmentData : batchManagerData;
  
  // Check if user is in a pilot batch (pilot batches don't show the program)
  const isPilotBatch = cohortData?.cohort?.is_pilot ?? false;

  return {
    isEnrolled: isEnrolled || isBatchManager,
    cohortId: cohortData?.cohort_id || null,
    cohortName: cohortData?.cohort?.name || null,
    cohortStartDate: cohortData?.cohort?.start_date || null,
    memberStatus: isEnrolled ? enrollmentData?.member_status : 'BATCH_MANAGER',
    isBatchManager,
    isPilotBatch,
    allManagedCohorts, // NEW: All cohorts managed by this batch manager
    loading: enrollmentLoading || batchManagerLoading || allManagedLoading,
  };
};
