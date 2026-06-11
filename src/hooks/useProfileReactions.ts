import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ReactionCount {
  emoji: string;
  count: number;
}

interface ProfileReactions {
  counts: ReactionCount[];
  userReaction: string | null;
}

export const useProfileReactions = (profileId: string, currentUserId?: string | null) => {
  const [reactions, setReactions] = useState<ProfileReactions>({ counts: [], userReaction: null });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reactions for a profile
  const fetchReactions = useCallback(async () => {
    if (!profileId) return;
    
    try {
      // Get all reactions for this profile
      const { data: allReactions, error } = await supabase
        .from("profile_reactions")
        .select("emoji, reactor_id")
        .eq("target_id", profileId);

      if (error) throw error;

      // Count reactions by emoji
      const countMap = new Map<string, number>();
      let userReaction: string | null = null;

      allReactions?.forEach((r) => {
        countMap.set(r.emoji, (countMap.get(r.emoji) || 0) + 1);
        if (r.reactor_id === currentUserId) {
          userReaction = r.emoji;
        }
      });

      const counts: ReactionCount[] = Array.from(countMap.entries()).map(([emoji, count]) => ({
        emoji,
        count,
      }));

      setReactions({ counts, userReaction });
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  }, [profileId, currentUserId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Toggle a reaction
  const toggleReaction = useCallback(async (emoji: string) => {
    if (!currentUserId || !profileId) return;
    
    setIsLoading(true);
    
    try {
      // Check if user already has this reaction
      if (reactions.userReaction === emoji) {
        // Remove the reaction
        await supabase
          .from("profile_reactions")
          .delete()
          .eq("reactor_id", currentUserId)
          .eq("target_id", profileId)
          .eq("emoji", emoji);
        
        setReactions(prev => ({
          counts: prev.counts.map(c => 
            c.emoji === emoji ? { ...c, count: Math.max(0, c.count - 1) } : c
          ).filter(c => c.count > 0),
          userReaction: null,
        }));
      } else {
        // Remove previous reaction if exists
        if (reactions.userReaction) {
          await supabase
            .from("profile_reactions")
            .delete()
            .eq("reactor_id", currentUserId)
            .eq("target_id", profileId)
            .eq("emoji", reactions.userReaction);
        }
        
        // Add new reaction
        await supabase
          .from("profile_reactions")
          .insert({
            reactor_id: currentUserId,
            target_id: profileId,
            emoji,
          });

        setReactions(prev => {
          const newCounts = [...prev.counts];
          
          // Decrease old reaction count
          if (prev.userReaction) {
            const oldIdx = newCounts.findIndex(c => c.emoji === prev.userReaction);
            if (oldIdx !== -1) {
              newCounts[oldIdx] = { ...newCounts[oldIdx], count: Math.max(0, newCounts[oldIdx].count - 1) };
              if (newCounts[oldIdx].count === 0) {
                newCounts.splice(oldIdx, 1);
              }
            }
          }
          
          // Increase new reaction count
          const newIdx = newCounts.findIndex(c => c.emoji === emoji);
          if (newIdx !== -1) {
            newCounts[newIdx] = { ...newCounts[newIdx], count: newCounts[newIdx].count + 1 };
          } else {
            newCounts.push({ emoji, count: 1 });
          }
          
          return { counts: newCounts, userReaction: emoji };
        });
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Refetch to sync state
      fetchReactions();
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, profileId, reactions.userReaction, fetchReactions]);

  // Get total reaction count
  const totalCount = reactions.counts.reduce((sum, r) => sum + r.count, 0);

  return {
    reactions: reactions.counts,
    userReaction: reactions.userReaction,
    totalCount,
    toggleReaction,
    isLoading,
    refetch: fetchReactions,
  };
};

// Batch hook for fetching reactions for multiple profiles
export const useBatchProfileReactions = (profileIds: string[], currentUserId?: string | null) => {
  const [reactionsMap, setReactionsMap] = useState<Map<string, ProfileReactions>>(new Map());

  const fetchAllReactions = useCallback(async () => {
    if (!profileIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from("profile_reactions")
        .select("target_id, emoji, reactor_id")
        .in("target_id", profileIds);

      if (error) throw error;

      const newMap = new Map<string, ProfileReactions>();
      
      // Initialize all profiles
      profileIds.forEach(id => {
        newMap.set(id, { counts: [], userReaction: null });
      });

      // Process reactions
      data?.forEach((r) => {
        const current = newMap.get(r.target_id) || { counts: [], userReaction: null };
        
        // Update user reaction
        if (r.reactor_id === currentUserId) {
          current.userReaction = r.emoji;
        }
        
        // Update counts
        const existingCount = current.counts.find(c => c.emoji === r.emoji);
        if (existingCount) {
          existingCount.count++;
        } else {
          current.counts.push({ emoji: r.emoji, count: 1 });
        }
        
        newMap.set(r.target_id, current);
      });

      setReactionsMap(newMap);
    } catch (error) {
      console.error("Error fetching batch reactions:", error);
    }
  }, [profileIds, currentUserId]);

  useEffect(() => {
    fetchAllReactions();
  }, [fetchAllReactions]);

  return { reactionsMap, refetch: fetchAllReactions };
};
