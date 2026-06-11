import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useIsAdmin } from "./useIsAdmin";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// User list types for dialogs
export interface InactiveUser {
  id: string;
  username: string;
  avatar_url: string | null;
  last_seen_at: string;
}

export interface DropoffUser {
  id: string;
  username: string;
  avatar_url: string | null;
  archetype: string | null;
  bio: string | null;
  created_at: string;
}

// Dashboard statistics interface
export interface DashboardStats {
  totalUsers: number;
  totalMatches: number;
  acceptedMatches: number;
  pendingMatches: number;
  totalProjects: number;
  totalMessages: number;
  founderSubscriptions: number;
  totalRevenue: number;
  pendingPayments: number;
  approvedPayments: number;
  buildersCount: number;
  sellersCount: number;
  investorsCount: number;
  startersCount: number;
  // Voucher cost (marketing)
  vouchersCost: number;
  vouchersUsedCount: number;
  // Subscription breakdown by tier
  subscriptionsByTier: {
    FREE: number;
    ADVENTURER: number;
    FOUNDER: number;
    ALPHA: number;
  };
  // Advanced metrics
  conversionRate: number;
  dau: number;
  mau: number;
  inactiveUsers30d: number;
  onboardingDropoff: number;
  projectsByStatus: {
    IDEA: number;
    MVP: number;
    SCALE: number;
  };
  // Introduction metrics
  totalIntroductions: number;
  engagedIntroductions: number;
  introductionEngagementRate: number;
  // Signup source distribution
  signupSourceDistribution: {
    google: number;
    social_media: number;
    acceleration: number;
    friends: number;
    whatsapp: number;
    other: number;
    not_answered: number;
  };
  // User lists for dialogs
  inactiveUsersList: InactiveUser[];
  dropoffUsersList: DropoffUser[];
  // Signup source "other" responses
  signupSourceOtherResponses: Array<{
    username: string;
    response: string;
  }>;
}

import type { Archetype } from "@/types/archetype";

export interface UserWithDetails {
  id: string;
  username: string;
  archetype: Archetype;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  is_online: boolean;
  last_seen_at: string | null;
  subscription_tier: "FREE" | "ADVENTURER" | "FOUNDER" | "ALPHA" | "BASIC";
  is_banned: boolean;
  has_phone: boolean;
}

export interface BannedUser {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  created_at: string;
  expires_at: string | null;
}

export interface MatchWithDetails {
  id: string;
  requester_id: string;
  target_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  created_at: string;
  requester_username: string;
  target_username: string;
  message_count: number;
}

export interface ProjectWithDetails {
  id: string;
  title: string;
  description: string | null;
  status: "IDEA" | "MVP" | "SCALE";
  owner_id: string;
  owner_username: string;
  created_at: string;
  is_recruiting: boolean;
  is_showcase: boolean;
  is_demo: boolean;
  member_count: number;
  open_roles: number;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  role_name: string | null;
  joined_at: string;
}

export interface PaymentWithDetails {
  id: string;
  user_id: string;
  user_email: string;
  product_type: string;
  status: string;
  extracted_amount: number | null;
  created_at: string;
  receipt_url: string;
}

export interface VoucherWithDetails {
  id: string;
  code: string;
  tier: 'ADVENTURER' | 'FOUNDER';
  duration_months: number | null;
  created_at: string;
  created_by: string | null;
  used_at: string | null;
  used_by: string | null;
  used_by_username?: string;
  expires_at: string | null;
  notes: string | null;
}

export interface SocialPaymentWithDetails {
  id: string;
  user_id: string;
  username: string;
  platform: string;
  status: string;
  ai_confidence: number | null;
  created_at: string;
  evidence_url: string;
}


export interface GrowthDataPoint {
  date: string;
  users: number;
  matches: number;
  acceptedMatches: number;
  acceptedIntroductions: number;
}

export interface DailySignupsDataPoint {
  date: string;
  count: number;
}

export interface IntroductionWithDetails {
  id: string;
  introducer_id: string;
  introducer_username: string;
  introduced_id: string;
  introduced_username: string;
  recipient_id: string;
  recipient_username: string;
  project_title: string | null;
  status: string;
  message_count: number;
  has_engagement: boolean;
  created_at: string;
}

export function useAdminDashboard() {
  const { t } = useTranslation();
  const { data: authData } = useAuth();
  const queryClient = useQueryClient();

  // Use centralized admin hook
  const { isAdmin, isLoading: checkingAdmin } = useIsAdmin();

  // Dashboard stats with advanced metrics
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-dashboard-stats", "v2"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        profilesRes,
        matchesRes,
        projectsRes,
        messagesRes,
        subscriptionsRes,
        paymentsRes,
        dauRes,
        mauRes,
        inactiveRes,
        onboardingDropoffRes,
        introductionsRes,
        signupSourceRes,
        usedVouchersRes,
        inactiveUsersListRes,
        dropoffUsersListRes,
        socialPaymentsRes,
        vouchersUsedRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, archetype", { count: "exact" }),
        supabase.from("matches").select("id, status", { count: "exact" }),
        supabase.from("projects").select("id, status"),
        supabase.from("messages").select("id", { count: "exact" }),
        supabase.from("subscriptions").select("id, user_id, tier, expires_at"),
        supabase.from("payment_receipts").select("id, user_id, status, extracted_amount"),
        // DAU - users active in last 24h
        supabase.from("profiles").select("id", { count: "exact" }).gte("last_seen_at", oneDayAgo.toISOString()),
        // MAU - users active in last 30 days
        supabase.from("profiles").select("id", { count: "exact" }).gte("last_seen_at", thirtyDaysAgo.toISOString()),
        // Inactive users - not seen in 30+ days
        supabase.from("profiles").select("id", { count: "exact" })
          .lt("last_seen_at", thirtyDaysAgo.toISOString()),
        // Onboarding dropoff - users without archetype or bio
        supabase.from("profiles").select("id", { count: "exact" })
          .or("archetype.is.null,bio.is.null"),
        // Introductions with group conversations
        supabase.from("founder_introductions").select("id, group_conversation_id"),
        // Signup source distribution (include signup_source_other and username for "other" details)
        supabase.from("profiles").select("signup_source, signup_source_other, username"),
        // Used vouchers for marketing cost calculation
        supabase.from("vouchers").select("tier, duration_months").not("used_at", "is", null),
        // Inactive users list for dialog
        supabase.from("profiles").select("id, username, avatar_url, last_seen_at")
          .lt("last_seen_at", thirtyDaysAgo.toISOString())
          .order("last_seen_at", { ascending: false })
          .limit(50),
        // Dropoff users list for dialog
        supabase.from("profiles").select("id, username, avatar_url, archetype, bio, created_at")
          .or("archetype.is.null,bio.is.null")
          .order("created_at", { ascending: false })
          .limit(50),
        // Social payments approved (grants FOUNDER)
        supabase.from("social_payment_submissions").select("user_id").eq("status", "approved"),
        // Vouchers used (grants FOUNDER/ADVENTURER)
        supabase.from("vouchers").select("used_by, tier").not("used_by", "is", null),
      ]);

      const profiles = profilesRes.data || [];
      const matches = matchesRes.data || [];
      const payments = paymentsRes.data || [];
      const subscriptions = subscriptionsRes.data || [];
      const projects = projectsRes.data || [];
      const socialPayments = socialPaymentsRes.data || [];
      const vouchersUsed = vouchersUsedRes.data || [];

      const buildersCount = profiles.filter(p => p.archetype === "BUILDER").length;
      const sellersCount = profiles.filter(p => p.archetype === "SELLER").length;
      const investorsCount = profiles.filter(p => p.archetype === "INVESTOR").length;
      const startersCount = profiles.filter(p => p.archetype === "STARTER").length;
      const acceptedMatches = matches.filter(m => m.status === "ACCEPTED").length;
      const pendingMatches = matches.filter(m => m.status === "PENDING").length;
      const approvedPayments = payments.filter(p => p.status === "approved");
      const pendingPaymentsCount = payments.filter(p => p.status === "pending").length;
      const totalRevenue = approvedPayments.reduce((sum, p) => sum + (p.extracted_amount || 0), 0);
      
      // Count subscriptions by tier - combining all sources of premium access
      const currentTime = new Date().toISOString();
      const totalUsers = profilesRes.count || profiles.length || 0;
      
      // ALPHA users from subscriptions table (active only)
      const alphaCount = subscriptions.filter(s => 
        s.tier === "ALPHA" && (!s.expires_at || s.expires_at > currentTime)
      ).length;
      
      // Collect all users with paid access (FOUNDER or ADVENTURER) from different sources
      const paidUserIds = new Set<string>();
      
      // 1. From subscriptions table (FOUNDER/ADVENTURER with active subscription)
      subscriptions
        .filter(s => (s.tier === "FOUNDER" || s.tier === "ADVENTURER") && (!s.expires_at || s.expires_at > currentTime))
        .forEach(s => paidUserIds.add(s.user_id));
      
      // 2. From social payments (approved = FOUNDER access)
      socialPayments.forEach(sp => paidUserIds.add(sp.user_id));
      
      // 3. From PIX payments (approved = FOUNDER access)
      approvedPayments.forEach(p => p.user_id && paidUserIds.add(p.user_id));
      
      // 4. From vouchers used (grants tier based on voucher)
      vouchersUsed.forEach(v => v.used_by && paidUserIds.add(v.used_by));
      
      // Count ADVENTURER separately (only from subscriptions with explicit ADVENTURER tier)
      const adventurerUserIds = new Set<string>();
      subscriptions
        .filter(s => s.tier === "ADVENTURER" && (!s.expires_at || s.expires_at > currentTime))
        .forEach(s => adventurerUserIds.add(s.user_id));
      vouchersUsed
        .filter(v => v.tier === "ADVENTURER")
        .forEach(v => v.used_by && adventurerUserIds.add(v.used_by));
      
      // FOUNDER = all paid users minus ADVENTURER minus ALPHA
      const founderCount = paidUserIds.size - adventurerUserIds.size;
      const adventurerCount = adventurerUserIds.size;
      
      // FREE = total users minus all paid users minus ALPHA
      const freeCount = totalUsers - paidUserIds.size - alphaCount;
      
      const subscriptionsByTier = {
        FREE: freeCount,
        ADVENTURER: adventurerCount,
        FOUNDER: founderCount,
        ALPHA: alphaCount,
      };
      const founderSubscriptions = paidUserIds.size + alphaCount;

      // Projects by status
      const projectsByStatus = {
        IDEA: projects.filter(p => p.status === "IDEA").length,
        MVP: projects.filter(p => p.status === "MVP").length,
        SCALE: projects.filter(p => p.status === "SCALE").length,
      };

      // Conversion rate: users who got at least one accepted match
      const conversionRate = totalUsers > 0 ? (acceptedMatches / totalUsers) * 100 : 0;

      // Introduction metrics - count engaged introductions
      const introductions = introductionsRes.data || [];
      const totalIntroductions = introductions.length;
      // For now, count engaged as those with group conversations (messages will be counted in detail query)
      const engagedIntroductions = introductions.filter(i => i.group_conversation_id).length;
      const introductionEngagementRate = totalIntroductions > 0 
        ? (engagedIntroductions / totalIntroductions) * 100 
        : 0;

      // Signup source distribution
      const signupSources = signupSourceRes.data || [];
      const signupSourceDistribution = {
        google: signupSources.filter(p => p.signup_source === 'google').length,
        social_media: signupSources.filter(p => p.signup_source === 'social_media').length,
        acceleration: signupSources.filter(p => p.signup_source === 'acceleration').length,
        friends: signupSources.filter(p => p.signup_source === 'friends').length,
        whatsapp: signupSources.filter(p => p.signup_source === 'whatsapp').length,
        other: signupSources.filter(p => p.signup_source === 'other').length,
        not_answered: signupSources.filter(p => p.signup_source === null).length,
      };

      // Extract "other" responses with usernames
      const signupSourceOtherResponses = signupSources
        .filter(p => p.signup_source === 'other' && p.signup_source_other)
        .map(p => ({
          username: p.username || 'Anônimo',
          response: p.signup_source_other as string,
        }));

      // Calculate voucher cost based on tier and duration
      // Pricing: ADVENTURER 6m = R$39, FOUNDER 6m = R$39, FOUNDER lifetime = R$97
      const usedVouchers = usedVouchersRes.data || [];
      const vouchersCost = usedVouchers.reduce((total, v) => {
        if (v.tier === 'FOUNDER') {
          // Lifetime or 6 months
          return total + (v.duration_months === null ? 97 : 39);
        } else if (v.tier === 'ADVENTURER') {
          return total + 39;
        }
        return total;
      }, 0);
      const vouchersUsedCount = usedVouchers.length;

      return {
        totalUsers,
        totalMatches: matchesRes.count || 0,
        acceptedMatches,
        pendingMatches,
        totalProjects: projects.length,
        totalMessages: messagesRes.count || 0,
        founderSubscriptions,
        totalRevenue,
        pendingPayments: pendingPaymentsCount,
        approvedPayments: approvedPayments.length,
        buildersCount,
        sellersCount,
        investorsCount,
        startersCount,
        vouchersCost,
        vouchersUsedCount,
        subscriptionsByTier,
        conversionRate,
        dau: dauRes.count || 0,
        mau: mauRes.count || 0,
        inactiveUsers30d: inactiveRes.count || 0,
        onboardingDropoff: onboardingDropoffRes.count || 0,
        projectsByStatus,
        totalIntroductions,
        engagedIntroductions,
        introductionEngagementRate,
        signupSourceDistribution,
        inactiveUsersList: (inactiveUsersListRes.data || []) as InactiveUser[],
        dropoffUsersList: (dropoffUsersListRes.data || []) as DropoffUser[],
        signupSourceOtherResponses,
      };
    },
    enabled: isAdmin === true,
    staleTime: 30_000,
  });

  // Banned users list
  const { data: bannedUsers } = useQuery({
    queryKey: ["admin-banned-users"],
    queryFn: async (): Promise<BannedUser[]> => {
      const { data, error } = await supabase
        .from("banned_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin === true,
  });

  const { data: growthData, isLoading: loadingGrowth } = useQuery({
    queryKey: ["admin-growth-data"],
    queryFn: async (): Promise<GrowthDataPoint[]> => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [profilesRes, matchesRes, acceptedMatchesRes, introductionsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("matches")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("matches")
          .select("updated_at")
          .eq("status", "ACCEPTED")
          .gte("updated_at", thirtyDaysAgo.toISOString())
          .order("updated_at", { ascending: true }),
        supabase
          .from("founder_introductions")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true }),
      ]);

      // Group by date
      const dateMap = new Map<string, { users: number; matches: number; acceptedMatches: number; acceptedIntroductions: number }>();
      
      // Initialize all dates
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split("T")[0];
        dateMap.set(dateStr, { users: 0, matches: 0, acceptedMatches: 0, acceptedIntroductions: 0 });
      }

      // Count profiles
      (profilesRes.data || []).forEach(p => {
        const dateStr = new Date(p.created_at!).toISOString().split("T")[0];
        const current = dateMap.get(dateStr);
        if (current) current.users++;
      });

      // Count matches
      (matchesRes.data || []).forEach(m => {
        const dateStr = new Date(m.created_at!).toISOString().split("T")[0];
        const current = dateMap.get(dateStr);
        if (current) current.matches++;
      });

      // Count accepted matches by updated_at date
      (acceptedMatchesRes.data || []).forEach(m => {
        const dateStr = new Date(m.updated_at!).toISOString().split("T")[0];
        const current = dateMap.get(dateStr);
        if (current) current.acceptedMatches++;
      });

      // Count introductions
      (introductionsRes.data || []).forEach(i => {
        const dateStr = new Date(i.created_at!).toISOString().split("T")[0];
        const current = dateMap.get(dateStr);
        if (current) current.acceptedIntroductions++;
      });

      // Cumulative sum
      let cumulativeUsers = 0;
      let cumulativeMatches = 0;
      let cumulativeAcceptedMatches = 0;
      let cumulativeAcceptedIntroductions = 0;
      
      return Array.from(dateMap.entries()).map(([date, data]) => {
        cumulativeUsers += data.users;
        cumulativeMatches += data.matches;
        cumulativeAcceptedMatches += data.acceptedMatches;
        cumulativeAcceptedIntroductions += data.acceptedIntroductions;
        return { 
          date, 
          users: cumulativeUsers, 
          matches: cumulativeMatches,
          acceptedMatches: cumulativeAcceptedMatches,
          acceptedIntroductions: cumulativeAcceptedIntroductions,
        };
      });
    },
    enabled: isAdmin === true,
    staleTime: 60_000,
  });

  // Daily signups data for histogram (last 15 days)
  const { data: dailySignups, isLoading: loadingDailySignups } = useQuery({
    queryKey: ["admin-daily-signups"],
    queryFn: async (): Promise<DailySignupsDataPoint[]> => {
      // Calculate 15 days ago at midnight UTC
      const now = new Date();
      const fifteenDaysAgo = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 14,
        0, 0, 0, 0
      ));

      const { data: profilesRes } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", fifteenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      // Initialize all dates with 0 using UTC dates consistently
      const dateMap = new Map<string, number>();
      for (let i = 0; i <= 14; i++) {
        const date = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - (14 - i)
        ));
        // Use ISO date string (YYYY-MM-DD) based on UTC
        const dateStr = date.toISOString().split('T')[0];
        dateMap.set(dateStr, 0);
      }

      // Count signups per day using UTC date from created_at
      (profilesRes || []).forEach(p => {
        const createdDate = new Date(p.created_at!);
        // Use ISO date (UTC) for consistency with the map keys
        const dateStr = createdDate.toISOString().split('T')[0];
        const current = dateMap.get(dateStr);
        if (current !== undefined) {
          dateMap.set(dateStr, current + 1);
        }
      });

      return Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    },
    enabled: isAdmin === true,
    staleTime: 60_000,
  });

  // Users list with ban status
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<UserWithDetails[]> => {
      const [profilesRes, subscriptionsRes, bannedRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, archetype, avatar_url, bio, created_at, is_online, last_seen_at, phone")
          .order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("user_id, tier"),
        supabase.from("banned_users").select("user_id"),
      ]);

      const subMap = new Map(
        (subscriptionsRes.data || []).map(s => [s.user_id, s.tier])
      );

      const bannedSet = new Set(
        (bannedRes.data || []).map(b => b.user_id)
      );

      return (profilesRes.data || []).map(p => ({
        id: p.id,
        username: p.username,
        archetype: p.archetype,
        avatar_url: p.avatar_url,
        bio: p.bio,
        created_at: p.created_at || "",
        is_online: p.is_online || false,
        last_seen_at: p.last_seen_at,
        subscription_tier: (subMap.get(p.id) as "FREE" | "ADVENTURER" | "FOUNDER") || "FREE",
        is_banned: bannedSet.has(p.id),
        has_phone: !!p.phone,
      }));
    },
    enabled: isAdmin === true,
  });

  // Ban user mutation - registra ban e move para lixeira
  const banUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      // 1. Verificar se o perfil ainda existe antes de tentar banir
      const { data: profileExists } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!profileExists) {
        throw new Error("Usuário não encontrado ou já foi removido");
      }

      // 2. Registrar o ban na tabela banned_users
      const { error: banError } = await supabase.from("banned_users").insert({
        user_id: userId,
        banned_by: authData?.user?.id,
        reason,
      });
      if (banError) throw banError;

      // 3. Executar soft-delete para mover para lixeira
      const { error: deleteError } = await supabase.functions.invoke('soft-delete-user', {
        body: { 
          userId, 
          reason: `Banido: ${reason}` 
        }
      });
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-banned-users"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-profiles"] });
      toast.success(t("adminToasts.user.banned"));
    },
    onError: (error) => {
      toast.error(t("adminToasts.user.banError") + ": " + error.message);
    },
  });

  // Unban user mutation
  const unbanUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-banned-users"] });
      toast.success(t("adminToasts.user.unbanned"));
    },
    onError: (error) => {
      toast.error(t("adminToasts.user.unbanError") + ": " + error.message);
    },
  });

  // Delete demo project mutation (fake/test projects only)
  const deleteShowcaseProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("is_demo", true);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success(t("adminToasts.project.demoDeleted"));
    },
    onError: (error) => {
      toast.error(t("adminToasts.project.deleteError") + ": " + error.message);
    },
  });

  // Delete any project mutation (admin only)
  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success(t("adminToasts.project.deleted"));
    },
    onError: (error) => {
      toast.error(t("adminToasts.project.deleteError") + ": " + error.message);
    },
  });

  // Fetch project members
  const fetchProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
    const { data: members, error } = await supabase
      .from("project_members")
      .select(`
        id,
        user_id,
        joined_at,
        role_id,
        profiles:user_id (username, avatar_url),
        project_roles:role_id (role_name)
      `)
      .eq("project_id", projectId);

    if (error) throw error;

    return (members || []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      username: m.profiles?.username || "Unknown",
      avatar_url: m.profiles?.avatar_url,
      role_name: m.project_roles?.role_name || null,
      joined_at: m.joined_at || "",
    }));
  };

  // Matches list
  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: async (): Promise<MatchWithDetails[]> => {
      const [matchesRes, profilesRes, messagesRes] = await Promise.all([
        supabase
          .from("matches")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, username"),
        supabase.from("messages").select("match_id"),
      ]);

      const profileMap = new Map(
        (profilesRes.data || []).map(p => [p.id, p.username])
      );

      // Count messages per match
      const messageCountMap = new Map<string, number>();
      (messagesRes.data || []).forEach(m => {
        if (m.match_id) {
          messageCountMap.set(m.match_id, (messageCountMap.get(m.match_id) || 0) + 1);
        }
      });

      return (matchesRes.data || []).map(m => ({
        id: m.id,
        requester_id: m.requester_id,
        target_id: m.target_id,
        status: m.status as "PENDING" | "ACCEPTED" | "REJECTED",
        created_at: m.created_at || "",
        requester_username: profileMap.get(m.requester_id) || "Unknown",
        target_username: profileMap.get(m.target_id) || "Unknown",
        message_count: messageCountMap.get(m.id) || 0,
      }));
    },
    enabled: isAdmin === true,
  });

  // Projects list
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async (): Promise<ProjectWithDetails[]> => {
      const [projectsRes, profilesRes, membersRes, rolesRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, username"),
        supabase.from("project_members").select("project_id"),
        supabase.from("project_roles").select("project_id, is_filled"),
      ]);

      const profileMap = new Map(
        (profilesRes.data || []).map(p => [p.id, p.username])
      );

      // Count members per project
      const memberCountMap = new Map<string, number>();
      (membersRes.data || []).forEach(m => {
        memberCountMap.set(m.project_id, (memberCountMap.get(m.project_id) || 0) + 1);
      });

      // Count open roles per project
      const openRolesMap = new Map<string, number>();
      (rolesRes.data || []).forEach(r => {
        if (!r.is_filled) {
          openRolesMap.set(r.project_id, (openRolesMap.get(r.project_id) || 0) + 1);
        }
      });

      return (projectsRes.data || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status as "IDEA" | "MVP" | "SCALE",
        owner_id: p.owner_id,
        owner_username: profileMap.get(p.owner_id) || "Unknown",
        created_at: p.created_at || "",
        is_recruiting: p.is_recruiting || false,
        is_showcase: p.is_showcase || false,
        is_demo: (p as any).is_demo || false,
        member_count: memberCountMap.get(p.id) || 0,
        open_roles: openRolesMap.get(p.id) || 0,
      }));
    },
    enabled: isAdmin === true,
  });

  // Payments list
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async (): Promise<PaymentWithDetails[]> => {
      const { data, error } = await supabase
        .from("payment_receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        user_email: p.user_id,
        product_type: p.product_type,
        status: p.status,
        extracted_amount: p.extracted_amount,
        created_at: p.created_at,
        receipt_url: p.receipt_url,
      }));
    },
    enabled: isAdmin === true,
  });

  // Social Payments list
  const { data: socialPayments, isLoading: loadingSocialPayments } = useQuery({
    queryKey: ["admin-social-payments"],
    queryFn: async (): Promise<SocialPaymentWithDetails[]> => {
      const [paymentsRes, profilesRes] = await Promise.all([
        supabase
          .from("social_payment_submissions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, username"),
      ]);

      if (paymentsRes.error) throw paymentsRes.error;

      const profileMap = new Map(
        (profilesRes.data || []).map(p => [p.id, p.username])
      );

      return (paymentsRes.data || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        username: profileMap.get(p.user_id) || "Unknown",
        platform: p.platform,
        status: p.status,
        ai_confidence: p.ai_confidence,
        created_at: p.created_at,
        evidence_url: p.evidence_url,
      }));
    },
    enabled: isAdmin === true,
  });

  // Vouchers list
  const { data: vouchers, isLoading: loadingVouchers } = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: async (): Promise<VoucherWithDetails[]> => {
      const [vouchersRes, profilesRes] = await Promise.all([
        supabase
          .from("vouchers")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, username"),
      ]);

      if (vouchersRes.error) throw vouchersRes.error;

      const profileMap = new Map(
        (profilesRes.data || []).map(p => [p.id, p.username])
      );

      return (vouchersRes.data || []).map(v => ({
        id: v.id,
        code: v.code,
        tier: v.tier as 'ADVENTURER' | 'FOUNDER',
        duration_months: v.duration_months,
        created_at: v.created_at || '',
        created_by: v.created_by,
        used_at: v.used_at,
        used_by: v.used_by,
        used_by_username: v.used_by ? profileMap.get(v.used_by) : undefined,
        expires_at: v.expires_at,
        notes: v.notes,
      }));
    },
    enabled: isAdmin === true,
  });

  // Create voucher mutation
  const createVoucher = useMutation({
    mutationFn: async (data: { code: string; tier: 'ADVENTURER' | 'FOUNDER'; duration_months: number | null; notes: string | null }) => {
      const { error } = await supabase.from("vouchers").insert({
        code: data.code.toUpperCase(),
        tier: data.tier,
        duration_months: data.duration_months,
        notes: data.notes,
        created_by: authData?.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success(t("adminToasts.voucher.created"));
    },
    onError: (error) => {
      if (error.message.includes("duplicate")) {
        toast.error(t("adminToasts.voucher.duplicateCode"));
      } else {
        toast.error(t("adminToasts.voucher.createError") + ": " + error.message);
      }
    },
  });

  // Delete voucher mutation
  const deleteVoucher = useMutation({
    mutationFn: async (voucherId: string) => {
      const { error } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId)
        .is("used_by", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success(t("adminToasts.voucher.deleted"));
    },
    onError: (error) => {
      toast.error(t("adminToasts.voucher.deleteError") + ": " + error.message);
    },
  });


  // Introductions list with details
  const { data: introductions, isLoading: loadingIntroductions } = useQuery({
    queryKey: ["admin-introductions"],
    queryFn: async (): Promise<IntroductionWithDetails[]> => {
      const [introRes, profilesRes, projectsRes, messagesRes] = await Promise.all([
        supabase
          .from("founder_introductions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, username"),
        supabase.from("projects").select("id, title"),
        supabase.from("messages").select("group_conversation_id, sender_id"),
      ]);

      const profileMap = new Map(
        (profilesRes.data || []).map(p => [p.id, p.username])
      );

      const projectMap = new Map(
        (projectsRes.data || []).map(p => [p.id, p.title])
      );

      // Count messages per group conversation (excluding intro message from introducer)
      const messageCountMap = new Map<string, { total: number; fromOthers: Set<string> }>();
      (messagesRes.data || []).forEach(m => {
        if (m.group_conversation_id) {
          if (!messageCountMap.has(m.group_conversation_id)) {
            messageCountMap.set(m.group_conversation_id, { total: 0, fromOthers: new Set() });
          }
          const data = messageCountMap.get(m.group_conversation_id)!;
          data.total++;
          data.fromOthers.add(m.sender_id);
        }
      });

      return (introRes.data || []).map(intro => {
        const msgData = messageCountMap.get(intro.group_conversation_id || "") || { total: 0, fromOthers: new Set() };
        // Has engagement if there are messages from more than 1 person (not just the introducer)
        const hasEngagement = msgData.fromOthers.size > 1;

        return {
          id: intro.id,
          introducer_id: intro.introducer_id,
          introducer_username: profileMap.get(intro.introducer_id) || "Unknown",
          introduced_id: intro.introduced_id,
          introduced_username: profileMap.get(intro.introduced_id) || "Unknown",
          recipient_id: intro.recipient_id,
          recipient_username: profileMap.get(intro.recipient_id) || "Unknown",
          project_title: intro.project_id ? projectMap.get(intro.project_id) || null : null,
          status: intro.status || "ACTIVE",
          message_count: msgData.total,
          has_engagement: hasEngagement,
          created_at: intro.created_at || "",
        };
      });
    },
    enabled: isAdmin === true,
  });

  return {
    isAdmin,
    checkingAdmin,
    stats: stats || {
      totalUsers: 0,
      totalMatches: 0,
      acceptedMatches: 0,
      pendingMatches: 0,
      totalProjects: 0,
      totalMessages: 0,
      founderSubscriptions: 0,
      totalRevenue: 0,
      pendingPayments: 0,
      approvedPayments: 0,
      buildersCount: 0,
      sellersCount: 0,
      investorsCount: 0,
      vouchersCost: 0,
      vouchersUsedCount: 0,
      subscriptionsByTier: { FREE: 0, ADVENTURER: 0, FOUNDER: 0 },
      conversionRate: 0,
      dau: 0,
      mau: 0,
      retentionD1: 0,
      retentionD7: 0,
      retentionD30: 0,
      projectsByStatus: { IDEA: 0, MVP: 0, SCALE: 0 },
      totalIntroductions: 0,
      engagedIntroductions: 0,
      introductionEngagementRate: 0,
      signupSourceDistribution: { google: 0, social_media: 0, acceleration: 0, friends: 0, whatsapp: 0, other: 0, not_answered: 0 },
    },
    loadingStats,
    growthData: growthData || [],
    loadingGrowth,
    dailySignups: dailySignups || [],
    loadingDailySignups,
    users: users || [],
    loadingUsers,
    bannedUsers: bannedUsers || [],
    banUser,
    unbanUser,
    matches: matches || [],
    loadingMatches,
    refetchMatches: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    introductions: introductions || [],
    loadingIntroductions,
    projects: projects || [],
    loadingProjects,
    deleteShowcaseProject,
    deleteProject,
    fetchProjectMembers,
    payments: payments || [],
    loadingPayments,
    socialPayments: socialPayments || [],
    loadingSocialPayments,
    vouchers: vouchers || [],
    loadingVouchers,
    createVoucher,
    deleteVoucher,
  };
}
