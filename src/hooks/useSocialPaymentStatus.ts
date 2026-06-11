import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSocialPaymentStatus = (userId?: string) => {
  return useQuery({
    queryKey: ['social-payment-status', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('social_payment_submissions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking social payment status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
