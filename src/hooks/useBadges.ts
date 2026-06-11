import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Badge {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  description: string;
  description_en: string | null;
  description_es: string | null;
  icon: string;
  color: string;
  category: string;
  threshold: number;
  metric: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
  notified: boolean;
  badge: Badge;
}

export const useBadges = (userId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch all available badges
  const { data: allBadges = [], isLoading: isLoadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('threshold', { ascending: true });
      
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Fetch user's earned badges
  const { data: userBadges = [], isLoading: isLoadingUserBadges, refetch } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          user_id,
          badge_id,
          unlocked_at,
          notified,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as UserBadge[];
    },
    enabled: !!userId,
  });

  // Mark badges as notified
  const markAsNotified = useMutation({
    mutationFn: async (badgeIds: string[]) => {
      if (!userId || badgeIds.length === 0) return;
      
      const { error } = await supabase
        .from('user_badges')
        .update({ notified: true })
        .eq('user_id', userId)
        .in('badge_id', badgeIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', userId] });
    },
  });

  // Subscribe to realtime updates for new badges
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-badges-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  // Get unnotified badges
  const newBadges = userBadges.filter(ub => !ub.notified);

  // Get top 3 badges for showcase (most recent or highest tier)
  const topBadges = userBadges
    .slice(0, 3)
    .map(ub => ub.badge);

  return {
    allBadges,
    userBadges,
    newBadges,
    topBadges,
    isLoading: isLoadingBadges || isLoadingUserBadges,
    markAsNotified: markAsNotified.mutate,
    refetch,
  };
};

// Hook to fetch badges for multiple users (for Tavern cards)
export const useBatchUserBadges = (userIds: string[]) => {
  return useQuery({
    queryKey: ['batch-user-badges', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          user_id,
          badge:badges(*)
        `)
        .in('user_id', userIds);
      
      if (error) throw error;
      
      // Group badges by user
      const badgesByUser: Record<string, Badge[]> = {};
      for (const item of data || []) {
        if (!badgesByUser[item.user_id]) {
          badgesByUser[item.user_id] = [];
        }
        if (item.badge) {
          badgesByUser[item.user_id].push(item.badge as unknown as Badge);
        }
      }
      
      return badgesByUser;
    },
    enabled: userIds.length > 0,
  });
};
