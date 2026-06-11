import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePendingCount = (userId: string | null) => {
  return useQuery({
    queryKey: ['pending-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', userId)
        .eq('status', 'PENDING');

      if (error) {
        console.error('Error fetching pending count:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
