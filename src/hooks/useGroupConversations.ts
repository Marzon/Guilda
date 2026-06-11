import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

export interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  is_archived: boolean;
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    archetype: string;
  };
}

export interface LastMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

export interface GroupConversation {
  id: string;
  name: string | null;
  type: string;
  project_id: string | null;
  role_id: string | null;
  created_by: string;
  created_at: string;
  last_message_at: string | null;
  members: GroupMember[];
  last_message?: LastMessage;
  has_unread: boolean;
  is_archived: boolean;
  project?: { id: string; title: string } | null;
  role?: { id: string; role_name: string } | null;
}

export const useGroupConversations = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const groupConversationsQuery = useQuery({
    queryKey: ['group-conversations', userId],
    queryFn: async (): Promise<GroupConversation[]> => {
      if (!userId) return [];

      // Get group conversations where user is a member and not deleted
      const { data: memberships, error: membershipsError } = await supabase
        .from('group_conversation_members')
        .select('conversation_id, is_archived, is_deleted')
        .eq('user_id', userId)
        .or('is_deleted.is.null,is_deleted.eq.false');

      if (membershipsError) throw membershipsError;
      if (!memberships || memberships.length === 0) return [];

      const conversationIds = memberships.map(m => m.conversation_id);
      const membershipMap = new Map(memberships.map(m => [m.conversation_id, m.is_archived]));

      // Fetch conversations with all related data
      const { data: conversations, error: conversationsError } = await supabase
        .from('group_conversations')
        .select(`
          id,
          name,
          type,
          project_id,
          role_id,
          created_by,
          created_at,
          last_message_at
        `)
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationsError) throw conversationsError;
      if (!conversations) return [];

      // Fetch all members for these conversations
      const { data: allMembers, error: membersError } = await supabase
        .from('group_conversation_members')
        .select(`
          id,
          conversation_id,
          user_id,
          role,
          is_archived
        `)
        .in('conversation_id', conversationIds);

      if (membersError) throw membersError;

      // Get unique user IDs for profile fetch
      const userIds = [...new Set(allMembers?.map(m => m.user_id) || [])];
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, archetype')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch last messages
      const { data: lastMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at, read_at, group_conversation_id')
        .in('group_conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation
      const lastMessageMap = new Map<string, LastMessage>();
      lastMessages?.forEach(msg => {
        if (msg.group_conversation_id && !lastMessageMap.has(msg.group_conversation_id)) {
          lastMessageMap.set(msg.group_conversation_id, {
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            created_at: msg.created_at,
            read_at: msg.read_at
          });
        }
      });

      // Fetch projects if any
      const projectIds = conversations.filter(c => c.project_id).map(c => c.project_id as string);
      let projectMap = new Map<string, { id: string; title: string }>();
      if (projectIds.length > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds);
        projectMap = new Map(projects?.map(p => [p.id, p]) || []);
      }

      // Fetch roles if any
      const roleIds = conversations.filter(c => c.role_id).map(c => c.role_id as string);
      let roleMap = new Map<string, { id: string; role_name: string }>();
      if (roleIds.length > 0) {
        const { data: roles } = await supabase
          .from('project_roles')
          .select('id, role_name')
          .in('id', roleIds);
        roleMap = new Map(roles?.map(r => [r.id, r]) || []);
      }

      // Build final conversation objects
      return conversations.map(conv => {
        const members = (allMembers || [])
          .filter(m => m.conversation_id === conv.id)
          .map(m => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role,
            is_archived: m.is_archived || false,
            profile: profileMap.get(m.user_id) || {
              id: m.user_id,
              username: 'Unknown',
              avatar_url: null,
              archetype: 'BUILDER'
            }
          }));

        const lastMessage = lastMessageMap.get(conv.id);
        const has_unread = lastMessage 
          ? lastMessage.sender_id !== userId && !lastMessage.read_at 
          : false;

        return {
          id: conv.id,
          name: conv.name,
          type: conv.type,
          project_id: conv.project_id,
          role_id: conv.role_id,
          created_by: conv.created_by,
          created_at: conv.created_at,
          last_message_at: conv.last_message_at,
          members,
          last_message: lastMessage,
          has_unread,
          is_archived: membershipMap.get(conv.id) || false,
          project: conv.project_id ? projectMap.get(conv.project_id) || null : null,
          role: conv.role_id ? roleMap.get(conv.role_id) || null : null
        };
      });
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const archiveMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('group_conversation_members')
        .update({ is_archived: true })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['group-conversations', userId] });
      const previous = queryClient.getQueryData(['group-conversations', userId]);
      
      queryClient.setQueryData(['group-conversations', userId], (old: GroupConversation[] | undefined) => 
        old?.map(conv => conv.id === conversationId ? { ...conv, is_archived: true } : conv)
      );
      
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['group-conversations', userId], context?.previous);
      toast.error(i18n.t('groupChat.archiveError', 'Erro ao arquivar conversa'));
    },
    onSuccess: () => {
      toast.success(i18n.t('groupChat.archiveSuccess', 'Conversa arquivada'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['group-conversations', userId] });
    }
  });

  const unarchiveMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('group_conversation_members')
        .update({ is_archived: false })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['group-conversations', userId] });
      const previous = queryClient.getQueryData(['group-conversations', userId]);
      
      queryClient.setQueryData(['group-conversations', userId], (old: GroupConversation[] | undefined) => 
        old?.map(conv => conv.id === conversationId ? { ...conv, is_archived: false } : conv)
      );
      
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['group-conversations', userId], context?.previous);
      toast.error(i18n.t('groupChat.unarchiveError', 'Erro ao desarquivar conversa'));
    },
    onSuccess: () => {
      toast.success(i18n.t('groupChat.unarchiveSuccess', 'Conversa desarquivada'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['group-conversations', userId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      // Soft delete - just mark as deleted for this user
      const { error } = await supabase
        .from('group_conversation_members')
        .update({ is_deleted: true })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['group-conversations', userId] });
      const previous = queryClient.getQueryData(['group-conversations', userId]);
      
      queryClient.setQueryData(['group-conversations', userId], (old: GroupConversation[] | undefined) => 
        old?.filter(conv => conv.id !== conversationId)
      );
      
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['group-conversations', userId], context?.previous);
      toast.error(i18n.t('groupChat.deleteError', 'Erro ao excluir grupo'));
    },
    onSuccess: () => {
      toast.success(i18n.t('messages.deletedForYou', 'Conversa apagada para você'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['group-conversations', userId] });
    }
  });

  return {
    groupConversations: groupConversationsQuery.data || [],
    isLoading: groupConversationsQuery.isLoading,
    archiveGroupConversation: archiveMutation.mutate,
    unarchiveGroupConversation: unarchiveMutation.mutate,
    deleteGroupConversation: deleteMutation.mutate,
    isArchiving: archiveMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
