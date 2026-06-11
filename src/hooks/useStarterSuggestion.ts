import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useQueryClient } from "@tanstack/react-query";

interface UseStarterSuggestionReturn {
  showSuggestion: boolean;
  isLoading: boolean;
  acceptMigration: () => Promise<void>;
  dismissSuggestion: () => Promise<void>;
  isAccepting: boolean;
}

export const useStarterSuggestion = (userId: string | null): UseStarterSuggestionReturn => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  // Check if user is a candidate for STARTER
  useEffect(() => {
    const checkCandidate = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Delay to not show immediately after page load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if tour modal is showing (localStorage)
        const tourShown = localStorage.getItem("founder_tour_shown");
        const tourSkipped = localStorage.getItem("founder_tour_skipped");
        if (!tourShown && !tourSkipped) {
          // Tour modal might be showing, wait a bit more
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const { data, error } = await supabase.rpc("check_starter_candidate", {
          p_user_id: userId,
        });

        if (error) {
          console.error("Error checking starter candidate:", error);
          setIsLoading(false);
          return;
        }

        setShowSuggestion(data === true);
      } catch (err) {
        console.error("Error in useStarterSuggestion:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkCandidate();
  }, [userId]);

  const acceptMigration = useCallback(async () => {
    if (!userId) return;
    
    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          archetype: "STARTER",
          looking_for: t("starterSuggestion.defaultLookingFor", "Buscando primeira oportunidade..."),
          offering: t("starterSuggestion.defaultOffering", "Motivação e vontade de aprender"),
        })
        .eq("id", userId);

      if (error) throw error;

      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });

      toast.success(t("starterSuggestion.successMessage"));
      setShowSuggestion(false);
    } catch (err) {
      console.error("Error accepting starter migration:", err);
      toast.error(t("common.error"));
    } finally {
      setIsAccepting(false);
    }
  }, [userId, t, queryClient]);

  const dismissSuggestion = useCallback(async () => {
    if (!userId) return;

    try {
      // Mark as dismissed in profile stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("stats")
        .eq("id", userId)
        .single();

      const currentStats = (profile?.stats as Record<string, unknown>) || {};
      const newStats = {
        ...currentStats,
        starter_suggestion_dismissed: true,
        starter_suggestion_dismissed_at: new Date().toISOString(),
      };

      await supabase
        .from("profiles")
        .update({ stats: newStats })
        .eq("id", userId);

      toast.info(t("starterSuggestion.dismissed"));
      setShowSuggestion(false);
    } catch (err) {
      console.error("Error dismissing starter suggestion:", err);
    }
  }, [userId, t]);

  return {
    showSuggestion,
    isLoading,
    acceptMigration,
    dismissSuggestion,
    isAccepting,
  };
};
