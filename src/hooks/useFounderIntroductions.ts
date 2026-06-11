import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { styledToast } from "@/utils/styledToast";
import { useLanguage } from "@/hooks/useLanguage";

export interface ProfileSummary {
  id: string;
  username: string;
  avatar_url: string | null;
  archetype: string;
}

export interface FounderIntroduction {
  id: string;
  introducer_id: string;
  introduced_id: string;
  recipient_id: string;
  project_id: string | null;
  role_id: string | null;
  group_conversation_id: string | null;
  message: string | null;
  status: string;
  created_at: string;
  introducer?: ProfileSummary;
  introduced?: ProfileSummary;
  recipient?: ProfileSummary;
  project?: { id: string; title: string } | null;
  role?: { id: string; role_name: string } | null;
}

export interface CreateIntroductionParams {
  introducedId: string;
  recipientId: string;
  message?: string;
  projectId?: string;
  roleId?: string;
}

export const useFounderIntroductions = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const introductionsQuery = useQuery({
    queryKey: ['founder-introductions', userId],
    queryFn: async (): Promise<FounderIntroduction[]> => {
      if (!userId) return [];

      const { data: introductions, error } = await supabase
        .from('founder_introductions')
        .select(`
          id,
          introducer_id,
          introduced_id,
          recipient_id,
          project_id,
          role_id,
          group_conversation_id,
          message,
          status,
          created_at
        `)
        .or(`introducer_id.eq.${userId},introduced_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!introductions || introductions.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(
        introductions.flatMap(i => [i.introducer_id, i.introduced_id, i.recipient_id])
      )];

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, archetype')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch projects if any
      const projectIds = introductions.filter(i => i.project_id).map(i => i.project_id as string);
      let projectMap = new Map<string, { id: string; title: string }>();
      if (projectIds.length > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds);
        projectMap = new Map(projects?.map(p => [p.id, p]) || []);
      }

      // Fetch roles if any
      const roleIds = introductions.filter(i => i.role_id).map(i => i.role_id as string);
      let roleMap = new Map<string, { id: string; role_name: string }>();
      if (roleIds.length > 0) {
        const { data: roles } = await supabase
          .from('project_roles')
          .select('id, role_name')
          .in('id', roleIds);
        roleMap = new Map(roles?.map(r => [r.id, r]) || []);
      }

      return introductions.map(intro => ({
        ...intro,
        introducer: profileMap.get(intro.introducer_id),
        introduced: profileMap.get(intro.introduced_id),
        recipient: profileMap.get(intro.recipient_id),
        project: intro.project_id ? projectMap.get(intro.project_id) || null : null,
        role: intro.role_id ? roleMap.get(intro.role_id) || null : null
      }));
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const createIntroductionMutation = useMutation({
    mutationFn: async (params: CreateIntroductionParams) => {
      // Validate that all 3 users are different
      if (!userId || params.introducedId === params.recipientId || 
          userId === params.introducedId || userId === params.recipientId) {
        throw new Error('Invalid participants: all three users must be different');
      }

      const { data, error } = await supabase.functions.invoke('create-introduction', {
        body: {
          introducedId: params.introducedId,
          recipientId: params.recipientId,
          message: params.message,
          projectId: params.projectId,
          roleId: params.roleId
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      styledToast.success("🤝 " + t('introductions.createSuccess'), t('introductions.createSuccessDescription') || "Apresentação enviada com sucesso");
      queryClient.invalidateQueries({ queryKey: ['founder-introductions', userId] });
      queryClient.invalidateQueries({ queryKey: ['group-conversations', userId] });
      return data;
    },
    onError: (error: Error) => {
      console.error('Error creating introduction:', error);
      styledToast.error("❌ " + t('introductions.createError'), t('introductions.createErrorDescription') || "Tente novamente mais tarde");
    }
  });

  const archiveIntroductionMutation = useMutation({
    mutationFn: async (introductionId: string) => {
      const { error } = await supabase
        .from('founder_introductions')
        .update({ status: 'ARCHIVED' })
        .eq('id', introductionId);

      if (error) throw error;
    },
    onMutate: async (introductionId) => {
      await queryClient.cancelQueries({ queryKey: ['founder-introductions', userId] });
      const previous = queryClient.getQueryData(['founder-introductions', userId]);
      
      queryClient.setQueryData(['founder-introductions', userId], (old: FounderIntroduction[] | undefined) => 
        old?.map(intro => intro.id === introductionId ? { ...intro, status: 'ARCHIVED' } : intro)
      );
      
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['founder-introductions', userId], context?.previous);
      toast.error(t('introductions.archiveError'));
    },
    onSuccess: () => {
      toast.success(t('introductions.archiveSuccess'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['founder-introductions', userId] });
    }
  });

  return {
    introductions: introductionsQuery.data || [],
    isLoading: introductionsQuery.isLoading,
    createIntroduction: createIntroductionMutation.mutateAsync,
    archiveIntroduction: archiveIntroductionMutation.mutate,
    isCreating: createIntroductionMutation.isPending,
    isArchiving: archiveIntroductionMutation.isPending
  };
};
