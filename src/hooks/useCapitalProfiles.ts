import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Investment {
  id: string;
  startup_name: string;
  website_url: string;
}

interface FounderProject {
  id: string;
  title: string;
  status: string;
  seeking_capital: boolean;
  capital_amount_sought: number | null;
}

export interface CapitalProfile {
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
  main_skills: string[] | null;
  tier?: string;
  // Investor-specific fields
  investments?: Investment[];
  investor_type?: string | null;
  investor_sectors?: string[] | null;
  investor_check_range?: string | null;
  // Founder-specific fields
  projects?: FounderProject[];
}

export const useCapitalProfiles = (currentUserArchetype: string | null | undefined) => {
  const isCurrentUserInvestor = currentUserArchetype === "INVESTOR";

  return useQuery({
    queryKey: ["capital-profiles", isCurrentUserInvestor ? "founders" : "investors"],
    queryFn: async () => {
      if (isCurrentUserInvestor) {
        // Investor views founders (BUILDER/SELLER)
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .in("archetype", ["BUILDER", "SELLER"])
          .order("last_seen_at", { ascending: false, nullsFirst: false });

        if (error) throw error;
        if (!profiles || profiles.length === 0) return [];

        const founderIds = profiles.map((p) => p.id);

        // Fetch subscription tiers
        const { data: subscriptions } = await supabase
          .from("subscriptions")
          .select("user_id, tier")
          .in("user_id", founderIds);

        // Fetch projects for founders
        const { data: projects } = await supabase
          .from("projects")
          .select("id, owner_id, title, status, seeking_capital, capital_amount_sought")
          .in("owner_id", founderIds);

        const subscriptionMap = new Map(
          subscriptions?.map((s) => [s.user_id, s.tier]) || []
        );

        // Group projects by owner
        const projectsByOwner = new Map<string, FounderProject[]>();
        projects?.forEach((p) => {
          const existing = projectsByOwner.get(p.owner_id) || [];
          existing.push({
            id: p.id,
            title: p.title,
            status: p.status,
            seeking_capital: p.seeking_capital || false,
            capital_amount_sought: p.capital_amount_sought,
          });
          projectsByOwner.set(p.owner_id, existing);
        });

        const enrichedProfiles: CapitalProfile[] = profiles.map((profile) => ({
          ...profile,
          tier: subscriptionMap.get(profile.id) || "FREE",
          projects: projectsByOwner.get(profile.id) || [],
        }));

        return enrichedProfiles.sort((a, b) => {
          const aOnline = a.is_online ? 1 : 0;
          const bOnline = b.is_online ? 1 : 0;
          if (aOnline !== bOnline) return bOnline - aOnline;

          const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
          const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
          return bTime - aTime;
        });
      } else {
        // Founder views investors
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("archetype", "INVESTOR")
          .order("last_seen_at", { ascending: false, nullsFirst: false });

        if (profilesError) throw profilesError;
        if (!profiles || profiles.length === 0) return [];

        const investorIds = profiles.map((p) => p.id);

        const { data: investments, error: investmentsError } = await supabase
          .from("investments")
          .select("*")
          .in("investor_id", investorIds)
          .order("created_at", { ascending: true });

        if (investmentsError) throw investmentsError;

        const { data: subscriptions } = await supabase
          .from("subscriptions")
          .select("user_id, tier")
          .in("user_id", investorIds);

        const subscriptionMap = new Map(
          subscriptions?.map((s) => [s.user_id, s.tier]) || []
        );

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

        const enrichedProfiles: CapitalProfile[] = profiles.map((profile) => ({
          ...profile,
          investments: investmentsByInvestor.get(profile.id) || [],
          tier: subscriptionMap.get(profile.id) || "FREE",
        }));

        return enrichedProfiles.sort((a, b) => {
          const aOnline = a.is_online ? 1 : 0;
          const bOnline = b.is_online ? 1 : 0;
          if (aOnline !== bOnline) return bOnline - aOnline;

          const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
          const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
          return bTime - aTime;
        });
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};
