import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeManager } from "@/hooks/useRealtimeManager";

interface PresenceState {
  [key: string]: {
    user_id: string;
    online_at: string;
  }[];
}

export const usePresence = (userId?: string) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { subscribe, unsubscribe, connectionStatus } = useRealtimeManager();

  useEffect(() => {
    if (!userId) return;

    // Mark user as online in DB
    const updatePresence = async () => {
      await supabase
        .from("profiles")
        .update({ 
          last_seen_at: new Date().toISOString(),
          is_online: true 
        })
        .eq("id", userId);
    };

    // Initial update
    updatePresence();

    // Update every 30 seconds while active
    const intervalId = setInterval(updatePresence, 30_000);

    // Mark as offline on unmount
    const markOffline = async () => {
      await supabase
        .from("profiles")
        .update({ 
          last_seen_at: new Date().toISOString(),
          is_online: false 
        })
        .eq("id", userId);
    };

    window.addEventListener("beforeunload", markOffline);

    // Use RealtimeManager for presence channel
    subscribe("presence-global", {
      presence: {
        key: userId,
        data: { user_id: userId },
      },
      onPresenceSync: (state: PresenceState) => {
        const online = new Set<string>();
        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            online.add(presence.user_id);
          });
        });
        setOnlineUsers(online);
      },
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", markOffline);
      markOffline();
      unsubscribe("presence-global");
    };
  }, [userId, subscribe, unsubscribe]);

  return { onlineUsers, connectionStatus };
};

export const isUserOnline = (lastSeenAt?: string | null): boolean => {
  if (!lastSeenAt) return false;
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  return new Date(lastSeenAt) > oneMinuteAgo;
};
