import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isUserOnline } from "@/hooks/usePresence";
import i18n from "@/i18n";

interface LastMessage {
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  last_message_at: string | null;
  is_archived_by_1?: boolean;
  is_archived_by_2?: boolean;
  other_user?: {
    id: string;
    username: string;
    avatar_url?: string;
    archetype: string;
    is_online?: boolean;
  };
  last_message?: LastMessage;
  has_unread?: boolean;
  is_archived?: boolean;
}

export const useConversations = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fetch conversations
      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participant_1,
          participant_2,
          created_at,
          last_message_at,
          is_archived_by_1,
          is_archived_by_2,
          is_deleted_by_1,
          is_deleted_by_2
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }

      if (!conversationsData || conversationsData.length === 0) return [];

      // Fetch profiles for other participants
      const otherUserIds = conversationsData.map((c) =>
        c.participant_1 === userId ? c.participant_2 : c.participant_1
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, archetype, is_online, last_seen_at")
        .in("id", otherUserIds);

      // Use isUserOnline function for consistent online status across app
      const profileMap = new Map(profiles?.map((p) => [p.id, {
        ...p,
        is_online: isUserOnline(p.last_seen_at) // Override with time-based check
      }]));

      // Fetch last message for each conversation
      const conversationIds = conversationsData.map(c => c.id);
      const { data: messagesData } = await supabase
        .from("messages")
        .select("conversation_id, content, sender_id, created_at, read_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      // Group messages by conversation and get the latest one + check for unread
      const lastMessageMap = new Map<string, LastMessage>();
      const unreadMap = new Map<string, boolean>();
      
      messagesData?.forEach(msg => {
        if (!lastMessageMap.has(msg.conversation_id!)) {
          lastMessageMap.set(msg.conversation_id!, {
            content: msg.content,
            sender_id: msg.sender_id,
            created_at: msg.created_at,
            read_at: msg.read_at
          });
        }
        // Check if there are unread messages from other user
        if (msg.sender_id !== userId && !msg.read_at) {
          unreadMap.set(msg.conversation_id!, true);
        }
      });

      // Filter out deleted conversations and map data
      return conversationsData
        .filter((c) => {
          const isParticipant1 = c.participant_1 === userId;
          const isDeleted = isParticipant1 ? c.is_deleted_by_1 : c.is_deleted_by_2;
          return !isDeleted;
        })
        .map((c) => {
          const isParticipant1 = c.participant_1 === userId;
          const isArchived = isParticipant1 ? c.is_archived_by_1 : c.is_archived_by_2;
          
          return {
            ...c,
            other_user: profileMap.get(
              c.participant_1 === userId ? c.participant_2 : c.participant_1
            ),
            last_message: lastMessageMap.get(c.id),
            has_unread: unreadMap.get(c.id) || false,
            is_archived: isArchived || false,
          };
        }) as Conversation[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        other_user_id: otherUserId,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
    },
  });

  const archiveConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      // Get the conversation to determine which field to update
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();
      
      if (!conv || !userId) throw new Error("Conversation not found");
      
      const isParticipant1 = conv.participant_1 === userId;
      const updateField = isParticipant1 ? "is_archived_by_1" : "is_archived_by_2";
      
      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: true })
        .eq("id", conversationId);

      if (error) throw error;
      
      return conversationId;
    },
    onMutate: async (conversationId) => {
      // Optimistic update - immediately update UI
      await queryClient.cancelQueries({ queryKey: ["conversations", userId] });
      
      const previousConversations = queryClient.getQueryData<Conversation[]>(["conversations", userId]);
      
      if (previousConversations) {
        queryClient.setQueryData<Conversation[]>(["conversations", userId], 
          previousConversations.map(conv => 
            conv.id === conversationId ? { ...conv, is_archived: true } : conv
          )
        );
      }
      
      return { previousConversations };
    },
    onSuccess: () => {
      toast.success(i18n.t("messages.archivedSuccess", "Conversa arquivada"));
    },
    onError: (error, _, context) => {
      console.error("Error archiving conversation:", error);
      toast.error(i18n.t("messages.archiveError", "Erro ao arquivar conversa"));
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations", userId], context.previousConversations);
      }
    },
    // ✅ REMOVIDO onSettled - optimistic update já é suficiente, evita dupla invalidação
  });

  const unarchiveConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();
      
      if (!conv || !userId) throw new Error("Conversation not found");
      
      const isParticipant1 = conv.participant_1 === userId;
      const updateField = isParticipant1 ? "is_archived_by_1" : "is_archived_by_2";
      
      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: false })
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
      toast.success(i18n.t("messages.unarchivedSuccess", "Conversa desarquivada"));
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      // Soft delete - just mark as deleted for this user
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();
      
      if (!conv || !userId) throw new Error("Conversation not found");
      
      const isParticipant1 = conv.participant_1 === userId;
      const updateField = isParticipant1 ? "is_deleted_by_1" : "is_deleted_by_2";
      
      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: true })
        .eq("id", conversationId);

      if (error) throw error;
      
      return conversationId;
    },
    onMutate: async (conversationId) => {
      // Optimistic update - immediately remove from UI
      await queryClient.cancelQueries({ queryKey: ["conversations", userId] });
      
      const previousConversations = queryClient.getQueryData<Conversation[]>(["conversations", userId]);
      
      if (previousConversations) {
        queryClient.setQueryData<Conversation[]>(["conversations", userId], 
          previousConversations.filter(conv => conv.id !== conversationId)
        );
      }
      
      return { previousConversations };
    },
    onSuccess: () => {
      toast.success(i18n.t("messages.deletedForYou", "Conversa apagada para você"));
    },
    onError: (error, _, context) => {
      console.error("Error deleting conversation:", error);
      toast.error(i18n.t("messages.deleteError", "Erro ao apagar conversa"));
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations", userId], context.previousConversations);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count", userId] });
    },
  });

  return {
    conversations,
    isLoading,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
    archiveConversation: archiveConversationMutation.mutate,
    unarchiveConversation: unarchiveConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
  };
};
