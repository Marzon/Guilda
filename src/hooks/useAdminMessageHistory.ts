import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSimilarMessage, findSimilarMessage } from "@/lib/textSimilarity";
import { useMemo } from "react";
import { ADMIN_USER_ID } from "@/lib/constants";

const ADMIN_ID = ADMIN_USER_ID;

interface MessageHistoryItem {
  content: string;
  created_at: string;
}

interface UseAdminMessageHistoryProps {
  userId: string | null;
  projectId?: string | null;
}

interface SentTemplateInfo {
  label: string;
  lastSentAt: string;
  similarity: number;
}

export const useAdminMessageHistory = ({ userId, projectId }: UseAdminMessageHistoryProps) => {
  // Fetch messages sent by admin to this specific user
  const { data: messageHistory = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['admin-message-history', userId],
    queryFn: async (): Promise<MessageHistoryItem[]> => {
      if (!userId) return [];
      
      // Get conversation between admin and user
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${ADMIN_ID},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${ADMIN_ID})`);
      
      if (!conversations || conversations.length === 0) return [];
      
      const conversationIds = conversations.map(c => c.id);
      
      // Get last 20 messages sent by admin in these conversations
      const { data: messages } = await supabase
        .from('messages')
        .select('content, created_at')
        .in('conversation_id', conversationIds)
        .eq('sender_id', ADMIN_ID)
        .order('created_at', { ascending: false })
        .limit(20);
      
      return messages || [];
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });

  // Fetch comments by admin on this project
  const { data: commentHistory = [], isLoading: loadingComments } = useQuery({
    queryKey: ['admin-comment-history', projectId],
    queryFn: async (): Promise<MessageHistoryItem[]> => {
      if (!projectId) return [];
      
      const { data: comments } = await supabase
        .from('project_comments')
        .select('content, created_at')
        .eq('project_id', projectId)
        .eq('author_id', ADMIN_ID)
        .order('created_at', { ascending: false })
        .limit(10);
      
      return comments || [];
    },
    enabled: !!projectId,
    staleTime: 60000,
  });

  // Get last interaction date
  const lastInteraction = useMemo(() => {
    const allHistory = [...messageHistory, ...commentHistory];
    if (allHistory.length === 0) return null;
    
    const sorted = allHistory.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted[0]?.created_at || null;
  }, [messageHistory, commentHistory]);

  // Check which templates have already been sent
  const checkTemplateSent = useMemo(() => {
    const combinedHistory = [...messageHistory, ...commentHistory];
    
    return (templateText: string): SentTemplateInfo | null => {
      const match = findSimilarMessage(templateText, combinedHistory);
      if (!match) return null;
      
      return {
        label: templateText.substring(0, 30) + '...',
        lastSentAt: match.created_at,
        similarity: match.similarity,
      };
    };
  }, [messageHistory, commentHistory]);

  // Check if a specific message content has been sent before
  const hasSentSimilar = useMemo(() => {
    const combinedHistory = [...messageHistory, ...commentHistory];
    
    return (content: string): { sent: boolean; lastSentAt?: string } => {
      const match = findSimilarMessage(content, combinedHistory);
      if (!match) return { sent: false };
      
      return { sent: true, lastSentAt: match.created_at };
    };
  }, [messageHistory, commentHistory]);

  return {
    messageHistory,
    commentHistory,
    lastInteraction,
    checkTemplateSent,
    hasSentSimilar,
    isLoading: loadingMessages || loadingComments,
  };
};
