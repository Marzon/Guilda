import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActiveProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  xp_level: number;
  last_seen_at: string | null;
  stats: {
    matches_sent?: number;
    matches_received?: number;
    messages_sent?: number;
    [key: string]: unknown;
  } | null;
}

/**
 * Fetches all active profiles without the skills filter.
 * Useful for admin features like testimonial requests where we want all users.
 */
export const useAllActiveProfiles = () => {
  return useQuery({
    queryKey: ["all-active-profiles"],
    queryFn: async (): Promise<ActiveProfile[]> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, xp_level, last_seen_at, stats")
        .order("username", { ascending: true });

      if (profilesError) {
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Fetch banned users
      const { data: bannedUsers } = await supabase
        .from("banned_users")
        .select("user_id")
        .or("expires_at.is.null,expires_at.gt.now()");

      const bannedUserIds = new Set(bannedUsers?.map(b => b.user_id) || []);

      // Filter out banned users only, keep all others
      return profiles.filter(p => !bannedUserIds.has(p.id)) as ActiveProfile[];
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
};
