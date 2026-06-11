import { useState, useEffect, useCallback } from "react";
import { addHours, formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

type DndDuration = 1 | 8 | 12;

const getLocale = (lang: string) => {
  switch (lang) {
    case "pt": return ptBR;
    case "es": return es;
    default: return enUS;
  }
};

export const useDoNotDisturb = (userId: string | undefined) => {
  const { currentLanguage } = useLanguage();
  const [dndUntil, setDndUntil] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial DND state
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchDndStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("dnd_until")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (data?.dnd_until) {
          const until = new Date(data.dnd_until);
          // Only set if still in the future
          if (until > new Date()) {
            setDndUntil(until);
          }
        }
      } catch (error) {
        console.error("Error fetching DND status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDndStatus();
  }, [userId]);

  // Check if DND is active
  const isDndActive = dndUntil !== null && dndUntil > new Date();

  // Get time remaining as formatted string
  const timeRemaining = isDndActive
    ? formatDistanceToNow(dndUntil, { 
        locale: getLocale(currentLanguage),
        addSuffix: false 
      })
    : null;

  // Activate DND for specified hours
  const activateDnd = useCallback(async (hours: DndDuration) => {
    if (!userId) return false;

    const until = addHours(new Date(), hours);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ dnd_until: until.toISOString() })
        .eq("id", userId);

      if (error) throw error;

      setDndUntil(until);
      return true;
    } catch (error) {
      console.error("Error activating DND:", error);
      return false;
    }
  }, [userId]);

  // Deactivate DND
  const deactivateDnd = useCallback(async () => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ dnd_until: null })
        .eq("id", userId);

      if (error) throw error;

      setDndUntil(null);
      return true;
    } catch (error) {
      console.error("Error deactivating DND:", error);
      return false;
    }
  }, [userId]);

  return {
    isDndActive,
    dndUntil,
    timeRemaining,
    activateDnd,
    deactivateDnd,
    isLoading,
  };
};
