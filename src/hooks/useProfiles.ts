import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isUserOnline } from "@/hooks/usePresence";
import type { Archetype } from "@/types/archetype";

interface Profile {
  id: string;
  username: string;
  archetype: Archetype;
  bio: string | null;
  stats: any;
  xp_level: number;
  avatar_url: string | null;
  created_at: string | null;
  last_seen_at: string | null;
  is_online: boolean | null;
  looking_for: string | null;
  offering: string | null;
}

interface ProfileWithSubscription extends Profile {
  isPremium: boolean;
  openRolesCount: number;
  projectId?: string;
  tier: "FREE" | "ADVENTURER" | "FOUNDER" | "ALPHA" | "BASIC";
  referralsCount: number;
}

export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<ProfileWithSubscription[]> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        toast.error("Failed to load profiles");
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      const profileIds = profiles.map((p) => p.id);

      // Batch fetch all data in parallel (eliminates N+1 queries)
      const [subscriptionResult, referralsResult, openRolesResult, allProjectsResult, bannedResult] = await Promise.all([
        // 1. Batch subscription info
        supabase.rpc("get_batch_subscription_info", { user_ids: profileIds }),
        // 2. Batch referrals count (uses new user_referrals table)
        supabase.rpc("get_batch_user_referrals", { user_ids: profileIds }),
        // 3. Open roles count
        supabase
          .from("projects")
          .select(`id, owner_id, project_roles!inner(is_filled)`)
          .eq("project_roles.is_filled", false),
        // 4. All projects for "View Project" link
        supabase
          .from("projects")
          .select("id, owner_id")
          .order("created_at", { ascending: false }),
        // 5. Banned users (active bans)
        supabase
          .from("banned_users")
          .select("user_id")
          .or("expires_at.is.null,expires_at.gt.now()"),
      ]);

      // Create sets for filtering
      const bannedUserIds = new Set(bannedResult.data?.map(b => b.user_id) || []);

      // Filter out banned users only
      const validProfiles = profiles.filter(
        p => !bannedUserIds.has(p.id)
      );

      // Process subscription data
      const subMap = new Map(
        subscriptionResult.data?.map((s) => [
          s.user_id,
          { isPremium: s.is_premium, tier: s.tier },
        ]) || []
      );

      // Process referrals data (now a single query instead of N queries)
      const referralsMap = new Map(
        referralsResult.data?.map((r) => [r.user_id, r.referrals_count]) || []
      );

      // Map first project by owner
      const ownerProjectMap = new Map<string, string>();
      allProjectsResult.data?.forEach((project) => {
        if (!ownerProjectMap.has(project.owner_id)) {
          ownerProjectMap.set(project.owner_id, project.id);
        }
      });

      // Count open roles
      const openRolesCountMap = new Map<string, number>();
      openRolesResult.data?.forEach((project) => {
        const existing = openRolesCountMap.get(project.owner_id) || 0;
        openRolesCountMap.set(project.owner_id, existing + 1);
      });

      const enrichedProfiles = validProfiles.map((profile) => ({
        ...profile,
        isPremium: subMap.get(profile.id)?.isPremium || false,
        openRolesCount: openRolesCountMap.get(profile.id) || 0,
        projectId: ownerProjectMap.get(profile.id),
        tier: (subMap.get(profile.id)?.tier || "FREE") as "FREE" | "ADVENTURER" | "FOUNDER" | "ALPHA" | "BASIC",
        referralsCount: referralsMap.get(profile.id) || 0,
      }));

      // Sort: online users first, then by last_seen_at
      return enrichedProfiles.sort((a, b) => {
        // 1. Online users first (using consistent isUserOnline check)
        const aOnline = isUserOnline(a.last_seen_at);
        const bOnline = isUserOnline(b.last_seen_at);
        if (aOnline !== bOnline) return aOnline ? -1 : 1;
        // 2. Then by last_seen_at (most recent first)
        const aLastSeen = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
        const bLastSeen = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
        return bLastSeen - aLastSeen;
      });
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};