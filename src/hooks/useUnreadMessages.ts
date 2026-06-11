import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: unreadCount = 0, isLoading } = useQuery({
    queryKey: ['unread-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { data, error } = await supabase.rpc("count_unread_messages", {
        p_user_id: userId,
      });

      if (error) {
        console.error("Error counting unread messages:", error);
        return 0;
      }

      return data || 0;
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
  };

  return {
    unreadCount,
    loading: isLoading,
    refresh,
  };
};
