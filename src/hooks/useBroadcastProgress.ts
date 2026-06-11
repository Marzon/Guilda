import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BroadcastProgress {
  broadcastId: string;
  title: string;
  status: string;
  totalRecipients: number;
  emailsSent: number;
  emailsFailed: number;
  emailsPending: number;
  progress: number;
  isComplete: boolean;
  completedAt?: string;
}

interface QueueStats {
  pending: number;
  sent: number;
  failed: number;
}

export const useBroadcastProgress = (broadcastId?: string | null) => {
  const queryClient = useQueryClient();

  // Fetch broadcast details
  const { data: broadcast, refetch: refetchBroadcast } = useQuery({
    queryKey: ["broadcast-progress", broadcastId],
    queryFn: async () => {
      if (!broadcastId) return null;
      
      const { data, error } = await supabase
        .from("admin_broadcasts")
        .select("id, title, status, recipients_count, emails_sent, sent_at")
        .eq("id", broadcastId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!broadcastId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "queued" || status === "processing" ? 2000 : false;
    },
  });

  // Fetch queue stats for this broadcast
  const { data: queueStats, refetch: refetchQueue } = useQuery({
    queryKey: ["broadcast-queue-stats", broadcastId],
    queryFn: async (): Promise<QueueStats> => {
      if (!broadcastId) return { pending: 0, sent: 0, failed: 0 };

      const [pendingResult, sentResult, failedResult] = await Promise.all([
        supabase
          .from("broadcast_email_queue")
          .select("id", { count: "exact", head: true })
          .eq("broadcast_id", broadcastId)
          .eq("status", "pending"),
        supabase
          .from("broadcast_email_queue")
          .select("id", { count: "exact", head: true })
          .eq("broadcast_id", broadcastId)
          .eq("status", "sent"),
        supabase
          .from("broadcast_email_queue")
          .select("id", { count: "exact", head: true })
          .eq("broadcast_id", broadcastId)
          .eq("status", "failed"),
      ]);

      return {
        pending: pendingResult.count || 0,
        sent: sentResult.count || 0,
        failed: failedResult.count || 0,
      };
    },
    enabled: !!broadcastId,
    refetchInterval: (query) => {
      return query.state.data && query.state.data.pending > 0 ? 2000 : false;
    },
  });

  // Calculate progress
  const progress: BroadcastProgress | null = broadcast && queueStats ? {
    broadcastId: broadcast.id,
    title: broadcast.title,
    status: broadcast.status,
    totalRecipients: broadcast.recipients_count || 0,
    emailsSent: queueStats.sent,
    emailsFailed: queueStats.failed,
    emailsPending: queueStats.pending,
    progress: broadcast.recipients_count 
      ? Math.round(((queueStats.sent + queueStats.failed) / broadcast.recipients_count) * 100)
      : 0,
    isComplete: queueStats.pending === 0 && (broadcast.status === "sent" || broadcast.status === "partial"),
    completedAt: broadcast.sent_at,
  } : null;

  // Force refresh
  const refresh = useCallback(() => {
    refetchBroadcast();
    refetchQueue();
  }, [refetchBroadcast, refetchQueue]);

  return {
    progress,
    isLoading: !broadcast || !queueStats,
    refresh,
  };
};

// Hook to get all active broadcasts (processing, queued, or recently completed)
export const useActiveBroadcasts = () => {
  const SHOW_COMPLETED_FOR_MS = 15000; // Show completed broadcasts for 15 seconds

  // Fetch active AND recently completed broadcasts
  const { data: broadcasts, refetch } = useQuery({
    queryKey: ["active-broadcasts"],
    queryFn: async () => {
      // Get broadcasts that are active OR completed in the last minute
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      
      const { data, error } = await supabase
        .from("admin_broadcasts")
        .select("id, title, status, recipients_count, emails_sent, created_at, sent_at")
        .or(`status.in.(queued,processing),and(status.in.(sent,partial),sent_at.gte.${oneMinuteAgo})`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 2000, // Poll every 2 seconds for better real-time updates
  });

  // Get queue stats for all broadcasts
  const { data: allQueueStats } = useQuery({
    queryKey: ["all-broadcast-queue-stats", broadcasts?.map(b => b.id)],
    queryFn: async () => {
      if (!broadcasts || broadcasts.length === 0) return {};

      const stats: Record<string, QueueStats> = {};

      await Promise.all(broadcasts.map(async (broadcast) => {
        const [pendingResult, sentResult, failedResult] = await Promise.all([
          supabase
            .from("broadcast_email_queue")
            .select("id", { count: "exact", head: true })
            .eq("broadcast_id", broadcast.id)
            .eq("status", "pending"),
          supabase
            .from("broadcast_email_queue")
            .select("id", { count: "exact", head: true })
            .eq("broadcast_id", broadcast.id)
            .eq("status", "sent"),
          supabase
            .from("broadcast_email_queue")
            .select("id", { count: "exact", head: true })
            .eq("broadcast_id", broadcast.id)
            .eq("status", "failed"),
        ]);

        stats[broadcast.id] = {
          pending: pendingResult.count || 0,
          sent: sentResult.count || 0,
          failed: failedResult.count || 0,
        };
      }));

      return stats;
    },
    enabled: (broadcasts?.length ?? 0) > 0,
    refetchInterval: 2000,
  });

  // Combine data and filter out old completed broadcasts
  const broadcastsList: BroadcastProgress[] = (broadcasts || [])
    .map(b => {
      const stats = allQueueStats?.[b.id] || { pending: 0, sent: 0, failed: 0 };
      const isComplete = b.status === "sent" || b.status === "partial";
      
      // Use queue stats if available, otherwise fall back to broadcast emails_sent
      const emailsSent = stats.sent > 0 ? stats.sent : (b.emails_sent || 0);
      const totalProcessed = stats.sent + stats.failed;
      
      return {
        broadcastId: b.id,
        title: b.title,
        status: b.status,
        totalRecipients: b.recipients_count || 0,
        emailsSent,
        emailsFailed: stats.failed,
        emailsPending: stats.pending,
        progress: b.recipients_count 
          ? Math.round((totalProcessed > 0 ? totalProcessed : emailsSent) / b.recipients_count * 100)
          : 0,
        isComplete,
        completedAt: b.sent_at,
      };
    })
    .filter(b => {
      // Keep if not complete
      if (!b.isComplete) return true;
      
      // Keep completed broadcasts for 15 seconds after completion
      if (b.completedAt) {
        const completedTime = new Date(b.completedAt).getTime();
        return Date.now() - completedTime < SHOW_COMPLETED_FOR_MS;
      }
      return false;
    });

  return {
    broadcasts: broadcastsList,
    hasActive: broadcastsList.length > 0,
    refetch,
  };
};
