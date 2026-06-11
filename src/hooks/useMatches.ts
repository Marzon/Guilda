import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackMatchAccepted } from "@/lib/analytics";
import { useTranslation } from "react-i18next";

import type { Archetype } from "@/types/archetype";

interface Match {
  id: string;
  requester_id: string;
  target_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  source?: string;
  created_at: string;
  requester?: {
    id: string;
    username: string;
    archetype: Archetype;
    bio: string | null;
    avatar_url: string | null;
    xp_level: number;
    last_seen_at?: string | null;
  };
  target?: {
    id: string;
    username: string;
    archetype: Archetype;
    bio: string | null;
    avatar_url: string | null;
    xp_level: number;
    last_seen_at?: string | null;
  };
}

export interface CreateMatchParams {
  targetId: string;
  source: string;
  subscription: {
    isPremium: boolean;
    canSendMatch: boolean;
  };
  requesterProfile?: { username: string } | null;
  onPaywallRequired?: () => void;
  onFirstMatch?: () => void;
}

export const useMatches = (userId: string | null) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const matchesQuery = useQuery({
    queryKey: ["matches", userId],
    queryFn: async (): Promise<Match[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          requester:profiles!matches_requester_id_fkey(*),
          target:profiles!matches_target_id_fkey(*)
        `)
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(t("matches.loadError"));
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // CREATE MATCH MUTATION
  const createMutation = useMutation({
    mutationFn: async ({ 
      targetId, 
      source, 
      subscription, 
      requesterProfile 
    }: CreateMatchParams) => {
      if (!userId) throw new Error("NO_USER");
      
      // Check if can send match
      if (!subscription.canSendMatch) {
        throw new Error("PAYWALL_REQUIRED");
      }

      // Increment daily matches if not premium
      if (!subscription.isPremium) {
        await supabase.rpc("increment_daily_matches", {
          p_user_id: userId,
        });
      }

      // Insert match
      const { data, error } = await supabase
        .from("matches")
        .insert({
          requester_id: userId,
          target_id: targetId,
          status: "PENDING",
          source,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") throw new Error("ALREADY_EXISTS");
        throw error;
      }

      return { matchId: data.id, targetId, requesterProfile };
    },
    // Optimistic update
    onMutate: async ({ targetId, source }) => {
      await queryClient.cancelQueries({ queryKey: ["matches", userId] });
      const previousMatches = queryClient.getQueryData<Match[]>(["matches", userId]);

      const optimisticMatch: Match = {
        id: `temp-${Date.now()}`,
        requester_id: userId!,
        target_id: targetId,
        status: "PENDING",
        source,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Match[]>(["matches", userId], (old = []) => 
        [optimisticMatch, ...old]
      );

      return { previousMatches };
    },
    onError: (err, vars, context) => {
      // Rollback
      if (context?.previousMatches) {
        queryClient.setQueryData(["matches", userId], context.previousMatches);
      }

      if (err.message === "PAYWALL_REQUIRED") {
        vars.onPaywallRequired?.();
        return;
      }
      if (err.message === "ALREADY_EXISTS") {
        toast.error(t("profileCard.alreadySent"));
        return;
      }
      if (err.message === "NO_USER") return;
      
      toast.error(t("common.error"));
    },
    onSuccess: async (data, vars) => {
      toast.success(t("profileCard.inviteSent"));
      vars.onFirstMatch?.();

      // Send notification
      if (data.requesterProfile) {
        try {
          await supabase.functions.invoke("create-notification", {
            body: {
              userId: data.targetId,
              type: "match_request",
              title: "🤝 Nova solicitação de conexão!",
              message: `${data.requesterProfile.username} quer se conectar com você`,
              relatedUserId: userId,
              sendEmail: false,
            },
          });
        } catch (err) {
          console.error("Failed to send notification:", err);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", userId] });
    },
  });

  // ACCEPT MATCH MUTATION
  const acceptMutation = useMutation({
    mutationFn: async ({
      matchId,
      requesterId,
      currentUserUsername,
    }: {
      matchId: string;
      requesterId: string;
      currentUserUsername: string;
    }) => {
      const { error } = await supabase
        .from("matches")
        .update({ status: "ACCEPTED" })
        .eq("id", matchId);

      if (error) throw error;

      // Send notification
      await supabase.functions.invoke("create-notification", {
        body: {
          userId: requesterId,
          type: "match_accepted",
          title: t("matches.connectionAcceptedTitle"),
          message: t("matches.acceptedRequest", { username: currentUserUsername }),
          relatedUserId: userId,
          relatedMatchId: matchId,
          sendEmail: false,
        },
      });
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ matchId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["matches", userId] });

      // Snapshot previous value
      const previousMatches = queryClient.getQueryData<Match[]>(["matches", userId]);

      // Optimistically update to the new value
      queryClient.setQueryData<Match[]>(["matches", userId], (old) =>
        old?.map((match) =>
          match.id === matchId ? { ...match, status: "ACCEPTED" as const } : match
        ) || []
      );

      return { previousMatches };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousMatches) {
        queryClient.setQueryData(["matches", userId], context.previousMatches);
      }
      toast.error(t("matches.acceptError"));
    },
    onSuccess: async (_data, { requesterId, currentUserUsername }) => {
      trackMatchAccepted();
      toast.success(t("matches.accepted"));
      
      // Send welcome message to encourage first conversation
      try {
        // Get or create conversation
        const { data: conversationId } = await supabase.rpc("get_or_create_conversation", {
          other_user_id: requesterId
        });
        
        if (conversationId) {
          // Get requester's username for personalized message
          const { data: requesterProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", requesterId)
            .single();
          
          const requesterName = requesterProfile?.username || "seu match";
          
          // Send welcome message - neutral message that makes sense for both parties
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: t("matches.welcomeMessage")
          });
        }
      } catch (err) {
        // Non-blocking - don't show error to user
        console.error("Failed to send welcome message:", err);
      }

      // Send notification to the requester (who had their match accepted) - uses create-notification which handles push internally
      try {
        await supabase.functions.invoke("create-notification", {
          body: {
            userId: requesterId,
            type: "match_accepted",
            title: t("matches.connectionAcceptedTitle"),
            message: t("matches.acceptedConnection", { username: currentUserUsername }),
            relatedUserId: userId,
            sendEmail: false,
          }
        });
      } catch (err) {
        console.error("Failed to send match accepted notification:", err);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["matches", userId] });
    },
  });

  // REJECT MATCH MUTATION
  const rejectMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from("matches")
        .update({ status: "REJECTED" })
        .eq("id", matchId);

      if (error) throw error;
    },
    // Optimistic update
    onMutate: async (matchId) => {
      await queryClient.cancelQueries({ queryKey: ["matches", userId] });
      const previousMatches = queryClient.getQueryData<Match[]>(["matches", userId]);

      queryClient.setQueryData<Match[]>(["matches", userId], (old) =>
        old?.map((match) =>
          match.id === matchId ? { ...match, status: "REJECTED" as const } : match
        ) || []
      );

      return { previousMatches };
    },
    onError: (_err, _matchId, context) => {
      if (context?.previousMatches) {
        queryClient.setQueryData(["matches", userId], context.previousMatches);
      }
      toast.error(t("matches.rejectError"));
    },
    onSuccess: () => {
      toast.success(t("matches.rejected"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", userId] });
    },
  });

  // CANCEL MATCH MUTATION
  const cancelMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", matchId);

      if (error) throw error;
    },
    // Optimistic update - remove from list
    onMutate: async (matchId) => {
      await queryClient.cancelQueries({ queryKey: ["matches", userId] });
      const previousMatches = queryClient.getQueryData<Match[]>(["matches", userId]);

      queryClient.setQueryData<Match[]>(["matches", userId], (old) =>
        old?.filter((match) => match.id !== matchId) || []
      );

      return { previousMatches };
    },
    onError: (_err, _matchId, context) => {
      if (context?.previousMatches) {
        queryClient.setQueryData(["matches", userId], context.previousMatches);
      }
      toast.error(t("matches.cancelError"));
    },
    onSuccess: () => {
      toast.success(t("matches.cancelled"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", userId] });
    },
  });

  return {
    matches: matchesQuery.data || [],
    isLoading: matchesQuery.isLoading,
    createMatch: createMutation.mutate,
    createMatchAsync: createMutation.mutateAsync,
    isCreatingMatch: createMutation.isPending,
    acceptMatch: acceptMutation.mutate,
    rejectMatch: rejectMutation.mutate,
    cancelMatch: cancelMutation.mutate,
  };
};
