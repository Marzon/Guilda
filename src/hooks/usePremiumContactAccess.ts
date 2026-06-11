import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePremiumContactAccess = (userId: string | undefined) => {
  const { data: contactAccessUserIds = [] } = useQuery({
    queryKey: ["premium-contact-access", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase.rpc("get_premium_contact_matches");
      return (data || []).map((row: { user_id: string }) => row.user_id);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  return {
    hasContactAccess: (otherUserId: string) => 
      contactAccessUserIds.includes(otherUserId),
    contactAccessUserIds,
  };
};
