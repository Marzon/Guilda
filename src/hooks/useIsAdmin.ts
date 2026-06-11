import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Centralized hook for checking admin status
 * Eliminates duplicate admin verification logic across the codebase
 * 
 * Uses React Query for caching - only one request per user session
 */
export function useIsAdmin() {
  const { data: auth } = useAuth();
  const userId = auth?.user?.id;

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { 
        _user_id: userId!, 
        _role: "admin" 
      });
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      return !!data;
    },
  });

  return { isAdmin, isLoading, userId };
}

/**
 * Hook to check if user is a batch manager for any cohort
 */
export function useIsBatchManager() {
  const { data: auth } = useAuth();
  const userId = auth?.user?.id;

  const { data: isBatchManager = false, isLoading } = useQuery({
    queryKey: ["is-batch-manager", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_batch_manager", { 
        _user_id: userId!
      });
      if (error) {
        console.error("Error checking batch manager status:", error);
        return false;
      }
      return !!data;
    },
  });

  return { isBatchManager, isLoading };
}

/**
 * Combined hook for checking admin or batch manager access
 * Useful for components that allow access to both roles
 */
export function useAdminOrBatchManager() {
  const { isAdmin, isLoading: adminLoading, userId } = useIsAdmin();
  const { isBatchManager, isLoading: batchManagerLoading } = useIsBatchManager();

  return {
    isAdmin,
    isBatchManager,
    hasAccess: isAdmin || isBatchManager,
    isLoading: adminLoading || batchManagerLoading,
    userId,
  };
}
