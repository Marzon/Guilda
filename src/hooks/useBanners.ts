import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BannerType = 'top_bar' | 'modal' | 'floating' | 'inline';
export type BannerAudience = 'all' | 'anonymous' | 'authenticated' | 'free' | 'premium';
export type BannerVariant = 'default' | 'success' | 'warning' | 'info' | 'gradient' | 'custom';

export interface Banner {
  id: string;
  name: string;
  slug: string | null;
  title: string;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  icon: string | null;
  image_url: string | null;
  type: BannerType;
  variant: BannerVariant;
  custom_gradient: string | null;
  custom_bg_color: string | null;
  custom_text_color: string | null;
  audience: BannerAudience;
  pages: string[];
  exclude_pages: string[];
  is_dismissible: boolean;
  dismiss_duration_hours: number;
  show_once_per_session: boolean;
  priority: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  views_count: number;
  clicks_count: number;
  dismisses_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type BannerInsert = Omit<Banner, 'id' | 'views_count' | 'clicks_count' | 'dismisses_count' | 'created_at' | 'updated_at'>;
export type BannerUpdate = Partial<BannerInsert>;

/**
 * Hook for admin to manage all banners
 */
export function useAdminBanners() {
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("priority", { ascending: false });
      
      if (error) throw error;
      return data as Banner[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (banner: Partial<BannerInsert>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("banners")
        .insert({
          name: banner.name || "Novo Banner",
          title: banner.title || "Título do Banner",
          type: banner.type || "top_bar",
          variant: banner.variant || "default",
          audience: banner.audience || "all",
          is_active: false,
          created_by: auth.user?.id,
          ...banner,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
      toast.success("Banner criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar banner: " + error.message);
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BannerUpdate }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("banners")
        .update({
          ...updates,
          updated_by: auth.user?.id,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
      toast.success("Banner atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar banner: " + error.message);
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
      toast.success("Banner excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir banner: " + error.message);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("banners")
        .update({ 
          is_active: isActive,
          updated_by: auth.user?.id,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
      toast.success(isActive ? "Banner publicado!" : "Banner despublicado!");
    },
    onError: (error) => {
      toast.error("Erro ao alterar status: " + error.message);
    },
  });

  const duplicateBanner = useMutation({
    mutationFn: async (banner: Banner) => {
      const { data: auth } = await supabase.auth.getUser();
      const { id, created_at, updated_at, views_count, clicks_count, dismisses_count, ...rest } = banner;
      const { data, error } = await supabase
        .from("banners")
        .insert({
          ...rest,
          name: `${rest.name} (cópia)`,
          slug: rest.slug ? `${rest.slug}-copy-${Date.now()}` : null,
          is_active: false,
          created_by: auth.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner duplicado!");
    },
    onError: (error) => {
      toast.error("Erro ao duplicar banner: " + error.message);
    },
  });

  return {
    banners,
    isLoading,
    error,
    refetch,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleActive,
    duplicateBanner,
  };
}

/**
 * Hook for displaying active banners to users
 */
export function useActiveBanners(options?: {
  currentPath?: string;
  isAuthenticated?: boolean;
  userTier?: string | null;
}) {
  const { currentPath = "/", isAuthenticated = false, userTier = "FREE" } = options || {};

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["active-banners", currentPath, isAuthenticated, userTier],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("priority", { ascending: false });
      
      if (error) throw error;
      
      // Filter by audience and pages client-side
      return (data as Banner[]).filter((banner) => {
        // Check audience
        if (banner.audience === "anonymous" && isAuthenticated) return false;
        if (banner.audience === "authenticated" && !isAuthenticated) return false;
        if (banner.audience === "free" && userTier !== "FREE") return false;
        if (banner.audience === "premium" && userTier === "FREE") return false;
        
        // Check pages
        if (banner.pages.length > 0 && !banner.pages.some(p => currentPath.startsWith(p))) return false;
        if (banner.exclude_pages.length > 0 && banner.exclude_pages.some(p => currentPath.startsWith(p))) return false;
        
        return true;
      });
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  return { banners, isLoading };
}

/**
 * Hook to track banner interactions
 */
export function useBannerInteractions() {
  const queryClient = useQueryClient();

  const trackView = async (bannerId: string) => {
    try {
      // Use type assertion since RPC was just created
      await (supabase.rpc as any)("increment_banner_views", { banner_id: bannerId });
    } catch {
      // Ignore tracking errors
    }
  };

  const trackClick = async (bannerId: string) => {
    try {
      await (supabase.rpc as any)("increment_banner_clicks", { banner_id: bannerId });
    } catch {
      // Ignore tracking errors
    }
  };

  const dismissBanner = async (bannerId: string, userId?: string, sessionId?: string) => {
    try {
      const dismissal = userId 
        ? { banner_id: bannerId, user_id: userId }
        : { banner_id: bannerId, session_id: sessionId };
      
      await supabase.from("banner_dismissals").upsert(dismissal as any, {
        onConflict: userId ? "banner_id,user_id" : "banner_id,session_id",
      });
      
      await (supabase.rpc as any)("increment_banner_dismisses", { banner_id: bannerId });
    } catch {
      // Ignore tracking errors
    }
    
    queryClient.invalidateQueries({ queryKey: ["banner-dismissals"] });
  };

  return { trackView, trackClick, dismissBanner };
}

/**
 * Hook to check if a banner was dismissed
 */
export function useBannerDismissals(userId?: string) {
  const sessionId = typeof window !== "undefined" 
    ? sessionStorage.getItem("banner_session_id") || (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem("banner_session_id", id);
        return id;
      })()
    : null;

  const { data: dismissals = [] } = useQuery({
    queryKey: ["banner-dismissals", userId, sessionId],
    queryFn: async () => {
      if (userId) {
        const { data } = await supabase
          .from("banner_dismissals")
          .select("banner_id, dismissed_at")
          .eq("user_id", userId);
        return data || [];
      } else if (sessionId) {
        const { data } = await supabase
          .from("banner_dismissals")
          .select("banner_id, dismissed_at")
          .eq("session_id", sessionId);
        return data || [];
      }
      return [];
    },
  });

  const isDismissed = (banner: Banner): boolean => {
    const dismissal = dismissals.find(d => d.banner_id === banner.id);
    if (!dismissal) return false;
    
    // Check if dismiss duration has passed
    const dismissedAt = new Date(dismissal.dismissed_at);
    const hoursAgo = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60);
    
    return hoursAgo < banner.dismiss_duration_hours;
  };

  return { dismissals, isDismissed, sessionId };
}
