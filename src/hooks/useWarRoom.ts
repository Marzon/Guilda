import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FounderProgress {
  id: string;
  user_id: string;
  cohort_id: string;
  current_day: number;
  status: string; // ACTIVE | STUCK | DIED | COMPLETED | PENDING
  last_activity_at: string | null;
  started_at: string;
  profile?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  latest_submission?: {
    id: string;
    status: string;
    content: string;
    ai_feedback: string | null;
    submitted_at: string;
    task?: {
      title: string;
      day_number: number;
    };
  };
}

interface WarRoomStats {
  total: number;
  active: number;
  stuck: number;
  died: number;
  completed: number;
  doCount: number;
  dieCount: number;
}

export const useWarRoom = (cohortId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch all founders' progress for a cohort (including enrolled members without progress)
  const { data: founders, isLoading } = useQuery({
    queryKey: ['war-room', cohortId],
    queryFn: async (): Promise<FounderProgress[]> => {
      if (!cohortId) return [];
      
      // Get all cohort members from subscriptions
      const { data: membersData, error: membersError } = await supabase
        .from('subscriptions')
        .select('user_id, member_status')
        .eq('cohort_id', cohortId)
        .in('member_status', ['ENROLLED', 'GRADUATED', 'DROPPED']);
      
      if (membersError) throw membersError;
      if (!membersData || membersData.length === 0) return [];
      
      const memberUserIds = membersData.map(m => m.user_id);
      
      // Get all progress entries for this cohort (excluding test users / batch managers)
      const { data: progressData, error: progressError } = await supabase
        .from('acceleration_user_progress')
        .select('*')
        .eq('cohort_id', cohortId)
        .eq('is_test_user', false);
      
      if (progressError) throw progressError;

      // Get profiles for all members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', memberUserIds);
      
      if (profilesError) throw profilesError;

      // Get latest submission for each user
      const { data: submissions, error: submissionsError } = await supabase
        .from('acceleration_submissions')
        .select(`
          id, user_id, status, content, ai_feedback, submitted_at,
          task:acceleration_tasks(title, day_number)
        `)
        .eq('cohort_id', cohortId)
        .in('user_id', memberUserIds)
        .order('submitted_at', { ascending: false });
      
      if (submissionsError) throw submissionsError;

      // Create maps for easy lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      const progressMap = new Map(progressData?.map(p => [p.user_id, p]));
      const memberStatusMap = new Map(membersData.map(m => [m.user_id, m.member_status]));
      const latestSubmissionMap = new Map<string, typeof submissions[0]>();
      
      submissions?.forEach(s => {
        if (!latestSubmissionMap.has(s.user_id)) {
          latestSubmissionMap.set(s.user_id, s);
        }
      });

      // Build founder progress for ALL members (with or without progress)
      return memberUserIds.map(userId => {
        const progress = progressMap.get(userId);
        const memberStatus = memberStatusMap.get(userId);
        
        // Determine status: use progress status, or derive from member_status
        let status = 'PENDING'; // Not started yet
        if (progress) {
          status = progress.status;
        } else if (memberStatus === 'DROPPED') {
          status = 'DIED';
        } else if (memberStatus === 'GRADUATED') {
          status = 'COMPLETED';
        }
        
        return {
          id: progress?.id || `pending-${userId}`,
          user_id: userId,
          cohort_id: cohortId,
          current_day: progress?.current_day || 0,
          status,
          last_activity_at: progress?.last_activity_at || null,
          started_at: progress?.started_at || null,
          profile: profileMap.get(userId),
          latest_submission: latestSubmissionMap.get(userId) ? {
            id: (latestSubmissionMap.get(userId) as any)?.id,
            status: (latestSubmissionMap.get(userId) as any)?.status,
            content: (latestSubmissionMap.get(userId) as any)?.content,
            ai_feedback: (latestSubmissionMap.get(userId) as any)?.ai_feedback,
            submitted_at: (latestSubmissionMap.get(userId) as any)?.submitted_at,
            task: (latestSubmissionMap.get(userId) as any)?.task as { title: string; day_number: number } | undefined,
          } : undefined,
        };
      }).sort((a, b) => b.current_day - a.current_day) as FounderProgress[];
    },
    enabled: !!cohortId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate stats
  const stats: WarRoomStats = {
    total: founders?.length || 0,
    active: founders?.filter(f => f.status === 'ACTIVE' || f.status === 'PENDING').length || 0,
    stuck: founders?.filter(f => f.status === 'STUCK').length || 0,
    died: founders?.filter(f => f.status === 'DIED').length || 0,
    completed: founders?.filter(f => f.status === 'COMPLETED').length || 0,
    doCount: founders?.filter(f => f.status === 'ACTIVE' || f.status === 'COMPLETED' || f.status === 'PENDING').length || 0,
    dieCount: founders?.filter(f => f.status === 'DIED').length || 0,
  };

  // Force pass a submission
  const forcePass = useMutation({
    mutationFn: async ({ 
      userId, 
      taskId, 
      adminFeedback 
    }: { 
      userId: string; 
      taskId: string; 
      adminFeedback: string;
    }) => {
      if (!cohortId) throw new Error('Missing cohort');
      
      // Get or create submission
      const { data: existingSubmission } = await supabase
        .from('acceleration_submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('cohort_id', cohortId)
        .maybeSingle();

      if (existingSubmission) {
        // Update existing
        const { error } = await supabase
          .from('acceleration_submissions')
          .update({
            status: 'APPROVED',
            admin_feedback: adminFeedback,
          })
          .eq('id', existingSubmission.id);
        
        if (error) throw error;
      } else {
        // Create new approved submission
        const { error } = await supabase
          .from('acceleration_submissions')
          .insert({
            user_id: userId,
            task_id: taskId,
            cohort_id: cohortId,
            content: '[Force Pass by Admin]',
            status: 'APPROVED',
            admin_feedback: adminFeedback,
          });
        
        if (error) throw error;
      }

      // Advance user to next day
      const { data: currentProgress } = await supabase
        .from('acceleration_user_progress')
        .select('current_day')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .single();

      if (currentProgress) {
        const nextDay = Math.min(currentProgress.current_day + 1, 15);
        await supabase
          .from('acceleration_user_progress')
          .update({ 
            current_day: nextDay,
            status: nextDay > 15 ? 'COMPLETED' : 'ACTIVE',
            last_activity_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('cohort_id', cohortId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-room', cohortId] });
      toast.success('Force Pass aplicado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao aplicar Force Pass');
      console.error('Force pass error:', error);
    },
  });

  // Force fail / mark as died
  const forceFail = useMutation({
    mutationFn: async ({ 
      userId, 
      adminFeedback 
    }: { 
      userId: string; 
      adminFeedback: string;
    }) => {
      if (!cohortId) throw new Error('Missing cohort');
      
      // Mark user as DIED
      const { error } = await supabase
        .from('acceleration_user_progress')
        .update({ 
          status: 'DIED',
          last_activity_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('cohort_id', cohortId);
      
      if (error) throw error;

      // Log the admin action (could add to an audit table if needed)
      console.log('User marked as DIED by admin:', { userId, adminFeedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-room', cohortId] });
      toast.success('Usuário marcado como DIED');
    },
    onError: (error) => {
      toast.error('Erro ao marcar usuário');
      console.error('Force fail error:', error);
    },
  });

  // Update status manually
  const updateStatus = useMutation({
    mutationFn: async ({ 
      userId, 
      status 
    }: { 
      userId: string; 
      status: 'ACTIVE' | 'STUCK' | 'COMPLETED' | 'DIED';
    }) => {
      if (!cohortId) throw new Error('Missing cohort');
      
      const { error } = await supabase
        .from('acceleration_user_progress')
        .update({ status })
        .eq('user_id', userId)
        .eq('cohort_id', cohortId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-room', cohortId] });
      toast.success('Status atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status');
      console.error('Update status error:', error);
    },
  });

  return {
    founders: founders || [],
    stats,
    isLoading,
    forcePass,
    forceFail,
    updateStatus,
  };
};

export type { FounderProgress, WarRoomStats };
