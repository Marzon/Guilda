import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_USER_ID } from "@/lib/constants";

export type ActivityType = 'message' | 'comment' | 'pending_match' | 'new_user' | 'inactive_user';

import type { Archetype } from "@/types/archetype";

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  avatarUrl: string | null;
  archetype: Archetype;
  content: string;
  context?: string;
  contextId?: string;
  timestamp: string;
  isRead?: boolean;
  isReplied?: boolean;
  targetUserId?: string;
  targetUsername?: string;
  conversationId?: string;
  projectId?: string;
  projectTitle?: string;
}

export interface EngagementStats {
  unreadMessages: number;
  commentsToday: number;
  pendingMatches24h: number;
  newUsersNoEngagement: number;
}

const ADMIN_ID = ADMIN_USER_ID;

export const useAdminEngagementFeed = (filter: ActivityType | 'all' = 'all') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch engagement stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-engagement-stats'],
    queryFn: async (): Promise<EngagementStats> => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // Unread messages to admin
      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read_at', null)
        .neq('sender_id', ADMIN_ID);

      // Comments today
      const { count: commentsToday } = await supabase
        .from('project_comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Pending matches > 24h
      const { count: pendingMatches24h } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')
        .lt('created_at', yesterday);

      // New users (48h) without sent messages
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', twoDaysAgo);

      let newUsersNoEngagement = 0;
      if (newUsers && newUsers.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('sender_id', { count: 'exact', head: true })
          .in('sender_id', newUsers.map(u => u.id));
        newUsersNoEngagement = newUsers.length - (count || 0);
      }

      return {
        unreadMessages: unreadMessages || 0,
        commentsToday: commentsToday || 0,
        pendingMatches24h: pendingMatches24h || 0,
        newUsersNoEngagement: Math.max(0, newUsersNoEngagement),
      };
    },
    refetchInterval: 30000,
  });

  // Fetch activities
  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['admin-engagement-feed', filter],
    queryFn: async (): Promise<Activity[]> => {
      const allActivities: Activity[] = [];
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch messages (last 7 days, excluding admin's own)
      if (filter === 'all' || filter === 'message') {
        const { data: messages } = await supabase
          .from('messages')
          .select(`
            id, content, created_at, read_at, sender_id, conversation_id,
            profiles:sender_id(username, avatar_url, archetype)
          `)
          .gte('created_at', sevenDaysAgo)
          .neq('sender_id', ADMIN_ID)
          .is('group_conversation_id', null)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messages && messages.length > 0) {
          // Get conversation IDs to check for admin replies
          const conversationIds = [...new Set(messages.map(m => m.conversation_id).filter(Boolean))];
          
          // Fetch admin replies in these conversations
          const { data: adminReplies } = await supabase
            .from('messages')
            .select('conversation_id, created_at')
            .eq('sender_id', ADMIN_ID)
            .in('conversation_id', conversationIds);

          // Create a map of conversation_id -> latest admin reply time
          const adminReplyMap = new Map<string, string>();
          if (adminReplies) {
            for (const reply of adminReplies) {
              if (reply.conversation_id) {
                const existing = adminReplyMap.get(reply.conversation_id);
                if (!existing || new Date(reply.created_at) > new Date(existing)) {
                  adminReplyMap.set(reply.conversation_id, reply.created_at);
                }
              }
            }
          }

          for (const msg of messages) {
            const profile = msg.profiles as any;
            if (profile) {
              // Check if admin replied after this message
              const adminReplyTime = msg.conversation_id ? adminReplyMap.get(msg.conversation_id) : null;
              const isReplied = adminReplyTime ? new Date(adminReplyTime) > new Date(msg.created_at) : false;

              allActivities.push({
                id: `msg-${msg.id}`,
                type: 'message',
                userId: msg.sender_id,
                username: profile.username || 'Usuário',
                avatarUrl: profile.avatar_url,
                archetype: profile.archetype || 'BUILDER',
                content: msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : ''),
                timestamp: msg.created_at,
                isRead: !!msg.read_at,
                isReplied,
                conversationId: msg.conversation_id || undefined,
              });
            }
          }
        }
      }

      // Fetch comments (last 7 days)
      if (filter === 'all' || filter === 'comment') {
        const { data: comments } = await supabase
          .from('project_comments')
          .select(`
            id, content, created_at, author_id, project_id,
            profiles:author_id(username, avatar_url, archetype),
            projects:project_id(title)
          `)
          .gte('created_at', sevenDaysAgo)
          .order('created_at', { ascending: false })
          .limit(30);

        if (comments && comments.length > 0) {
          // Get comment IDs to check for admin replies
          const commentIds = comments.map(c => c.id);
          
          // Fetch admin replies to these comments
          const { data: adminReplies } = await supabase
            .from('project_comments')
            .select('parent_id')
            .eq('author_id', ADMIN_ID)
            .in('parent_id', commentIds);

          const repliedCommentIds = new Set(adminReplies?.map(r => r.parent_id) || []);

          for (const comment of comments) {
            const profile = comment.profiles as any;
            const project = comment.projects as any;
            if (profile) {
              allActivities.push({
                id: `comment-${comment.id}`,
                type: 'comment',
                userId: comment.author_id,
                username: profile.username || 'Usuário',
                avatarUrl: profile.avatar_url,
                archetype: profile.archetype || 'BUILDER',
                content: comment.content.substring(0, 150) + (comment.content.length > 150 ? '...' : ''),
                context: project?.title || 'Startup',
                contextId: comment.id,
                projectId: comment.project_id,
                projectTitle: project?.title,
                isReplied: repliedCommentIds.has(comment.id),
                timestamp: (comment.created_at && comment.created_at !== 'null') 
                  ? comment.created_at 
                  : new Date().toISOString(),
              });
            }
          }
        }
      }

      // Fetch pending matches
      if (filter === 'all' || filter === 'pending_match') {
        const { data: matches } = await supabase
          .from('matches')
          .select(`
            id, created_at, requester_id, target_id,
            requester:requester_id(username, avatar_url, archetype),
            target:target_id(username, avatar_url, archetype)
          `)
          .eq('status', 'PENDING')
          .order('created_at', { ascending: true })
          .limit(30);

        if (matches) {
          for (const match of matches) {
            const requester = match.requester as any;
            const target = match.target as any;
            if (requester && target) {
              allActivities.push({
                id: `match-${match.id}`,
                type: 'pending_match',
                userId: match.requester_id,
                username: requester.username || 'Usuário',
                avatarUrl: requester.avatar_url,
                archetype: requester.archetype || 'BUILDER',
                content: `Aguardando resposta de ${target.username}`,
                targetUserId: match.target_id,
                targetUsername: target.username,
                timestamp: (match.created_at && match.created_at !== 'null') 
                  ? match.created_at 
                  : new Date().toISOString(),
              });
            }
          }
        }
      }

      // Fetch new users (last 48h)
      if (filter === 'all' || filter === 'new_user') {
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
        const { data: newUsers } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, archetype, bio, created_at')
          .gte('created_at', twoDaysAgo)
          .neq('id', ADMIN_ID)
          .order('created_at', { ascending: false });

        if (newUsers) {
          for (const user of newUsers) {
            allActivities.push({
              id: `new-${user.id}`,
              type: 'new_user',
              userId: user.id,
              username: user.username,
              avatarUrl: user.avatar_url,
              archetype: user.archetype,
              content: user.bio?.substring(0, 100) || 'Novo usuário na plataforma',
              timestamp: (user.created_at && user.created_at !== 'null') 
                ? user.created_at 
                : new Date().toISOString(),
            });
          }
        }
      }

      // Fetch inactive users (no activity in 7 days, but active before)
      if (filter === 'all' || filter === 'inactive_user') {
        const { data: inactiveUsers } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, archetype, last_seen_at')
          .lt('last_seen_at', sevenDaysAgo)
          .neq('id', ADMIN_ID)
          .order('last_seen_at', { ascending: false })
          .limit(20);

        if (inactiveUsers) {
          for (const user of inactiveUsers) {
            allActivities.push({
              id: `inactive-${user.id}`,
              type: 'inactive_user',
              userId: user.id,
              username: user.username,
              avatarUrl: user.avatar_url,
              archetype: user.archetype,
              content: `Última visita: ${user.last_seen_at && user.last_seen_at !== 'null' ? new Date(user.last_seen_at).toLocaleDateString('pt-BR') : 'Desconhecido'}`,
              timestamp: (user.last_seen_at && user.last_seen_at !== 'null') 
                ? user.last_seen_at 
                : new Date().toISOString(),
            });
          }
        }
      }

// Sort all by timestamp descending with validation
      return allActivities
        .filter(activity => {
          // Filter out activities with invalid timestamps
          if (!activity.timestamp || activity.timestamp === 'null') return false;
          const date = new Date(activity.timestamp);
          return !isNaN(date.getTime());
        })
        .sort((a, b) => {
          try {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          } catch {
            return 0;
          }
        });
    },
    refetchInterval: 30000,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ userId, content }: { userId: string; content: string }) => {
      // Get current user's ID (the admin who is logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      
      const adminId = user.id;

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${adminId},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${adminId})`)
        .maybeSingle();

      let conversationId = existingConv?.id;

      // Create conversation if doesn't exist
      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1: adminId,
            participant_2: userId,
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // Insert message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminId,
          content,
        });

      if (msgError) throw msgError;

      return { conversationId };
    },
    onSuccess: () => {
      toast({ title: "Mensagem enviada!" });
      queryClient.invalidateQueries({ queryKey: ['admin-engagement-feed'] });
      queryClient.invalidateQueries({ queryKey: ['admin-engagement-stats'] });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao enviar", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Reply to comment mutation
  const replyToComment = useMutation({
    mutationFn: async ({ projectId, parentId, content }: { projectId: string; parentId: string; content: string }) => {
      // Get current user's ID (the admin who is logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          parent_id: parentId,
          author_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Resposta enviada!" });
      queryClient.invalidateQueries({ queryKey: ['admin-engagement-feed'] });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao responder", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return {
    stats: stats || { unreadMessages: 0, commentsToday: 0, pendingMatches24h: 0, newUsersNoEngagement: 0 },
    activities: activities || [],
    loadingStats,
    loadingActivities,
    sendMessage,
    replyToComment,
  };
};
