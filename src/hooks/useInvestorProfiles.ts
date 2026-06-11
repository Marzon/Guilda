import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Investment {
  id: string;
  startup_name: string;
  website_url: string;
}

export interface InvestorProfile {
  id: string;
  username: string;
  archetype: string;
  avatar_url: string | null;
  bio: string | null;
  looking_for: string | null;
  offering: string | null;
  last_seen_at: string | null;
  is_online: boolean | null;
  created_at: string | null;
  investments: Investment[];
  tier?: string;
  investor_type: string | null;
  investor_sectors: string[] | null;
  investor_check_range: string | null;
}

export const useInvestorProfiles = () => {
  return useQuery({
    queryKey: ["investor-profiles"],
    queryFn: async () => {
      // Fetch investor profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("archetype", "INVESTOR")
        .order("last_seen_at", { ascending: false, nullsFirst: false });

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      // Get all investor IDs
      const investorIds = profiles.map((p) => p.id);

      // Fetch investments for all investors
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .in("investor_id", investorIds)
        .order("created_at", { ascending: true });

      if (investmentsError) throw investmentsError;

      // Fetch subscription tiers
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id, tier")
        .in("user_id", investorIds);

      const subscriptionMap = new Map(
        subscriptions?.map((s) => [s.user_id, s.tier]) || []
      );

      // Group investments by investor
      const investmentsByInvestor = new Map<string, Investment[]>();
      investments?.forEach((inv) => {
        const existing = investmentsByInvestor.get(inv.investor_id) || [];
        existing.push({
          id: inv.id,
          startup_name: inv.startup_name,
          website_url: inv.website_url,
        });
        investmentsByInvestor.set(inv.investor_id, existing);
      });

      // Combine profiles with investments
      const enrichedProfiles: InvestorProfile[] = profiles.map((profile) => ({
        ...profile,
        investments: investmentsByInvestor.get(profile.id) || [],
        tier: subscriptionMap.get(profile.id) || "FREE",
      }));

      // Sort: online first, then by last_seen_at
      return enrichedProfiles.sort((a, b) => {
        const aOnline = a.is_online ? 1 : 0;
        const bOnline = b.is_online ? 1 : 0;
        if (aOnline !== bOnline) return bOnline - aOnline;

        const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
        const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
        return bTime - aTime;
      });
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
