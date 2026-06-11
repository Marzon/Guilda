import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileViewer {
  id: string;
  username: string;
  avatar_url: string | null;
  archetype: "BUILDER" | "SELLER";
  viewed_at: string;
}

export const useMyProfileViewers = (userId: string | null, isPremium: boolean) => {
  return useQuery({
    queryKey: ['my-profile-viewers', userId, isPremium],
    queryFn: async (): Promise<{ viewers: ProfileViewer[]; count: number }> => {
      if (!userId) return { viewers: [], count: 0 };

      // Get count for all users
      const { count, error: countError } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_profile_id', userId);

      if (countError) {
        console.error('Error fetching viewer count:', countError);
        return { viewers: [], count: 0 };
      }

      // Only fetch full list for premium users
      if (!isPremium) {
        return { viewers: [], count: count || 0 };
      }

      // Fetch viewers with profile data (last 50)
      const { data, error } = await supabase
        .from('profile_views')
        .select(`
          viewed_at,
          viewer:profiles!profile_views_viewer_id_fkey(
            id, username, avatar_url, archetype
          )
        `)
        .eq('viewed_profile_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching viewers:', error);
        return { viewers: [], count: count || 0 };
      }

      const viewers: ProfileViewer[] = (data || [])
        .filter(item => item.viewer)
        .map(item => ({
          id: (item.viewer as any).id,
          username: (item.viewer as any).username,
          avatar_url: (item.viewer as any).avatar_url,
          archetype: (item.viewer as any).archetype,
          viewed_at: item.viewed_at,
        }));

      return { viewers, count: count || 0 };
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
};
