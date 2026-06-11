import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

interface AccelerationProgress {
  id: string;
  user_id: string;
  cohort_id: string;
  current_day: number;
  status: string;
  last_activity_at: string;
  started_at: string;
}

interface AccelerationSubmission {
  id: string;
  user_id: string;
  task_id: string;
  cohort_id: string;
  content: string;
  file_url: string | null;
  status: string;
  ai_feedback: string | null;
  admin_feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  task?: {
    id: string;
    day_number: number;
    title: string;
  };
}

export const useAccelerationProgress = (userId: string | null, cohortId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch user progress
  const { data: progress, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['acceleration-progress', userId, cohortId],
    queryFn: async (): Promise<AccelerationProgress | null> => {
      if (!userId || !cohortId) return null;
      
      const { data, error } = await supabase
        .from('acceleration_user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .maybeSingle();
      
      if (error) throw error;
      return data as AccelerationProgress | null;
    },
    enabled: !!userId && !!cohortId,
  });

  // Fetch user submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['acceleration-submissions', userId, cohortId],
    queryFn: async (): Promise<AccelerationSubmission[]> => {
      if (!userId || !cohortId) return [];
      
      // First, get submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('acceleration_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .order('submitted_at', { ascending: false });
      
      if (submissionsError) throw submissionsError;
      if (!submissionsData || submissionsData.length === 0) return [];

      // Get unique task IDs
      const taskIds = [...new Set(submissionsData.map(s => s.task_id))];
      
      // Fetch tasks separately
      const { data: tasksData, error: tasksError } = await supabase
        .from('acceleration_tasks')
        .select('id, day_number, title')
        .in('id', taskIds);
      
      if (tasksError) {
        console.warn('Failed to fetch tasks:', tasksError);
        // Return submissions without task info
        return submissionsData.map(s => ({ ...s, task: undefined })) as AccelerationSubmission[];
      }

      // Map tasks to submissions
      const tasksMap = new Map(tasksData?.map(t => [t.id, t]) || []);
      return submissionsData.map(s => ({
        ...s,
        task: tasksMap.get(s.task_id) || undefined
      })) as AccelerationSubmission[];
    },
    enabled: !!userId && !!cohortId,
  });

  // Initialize progress for first-time users
  const initializeProgress = useMutation({
    mutationFn: async () => {
      if (!userId || !cohortId) throw new Error('Missing user or cohort');
      
      const { data, error } = await supabase
        .from('acceleration_user_progress')
        .insert({
          user_id: userId,
          cohort_id: cohortId,
          current_day: 1,
          status: 'ACTIVE',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-progress', userId, cohortId] });
    },
    onError: (error) => {
      console.error('Failed to initialize progress:', error);
    },
  });

  // Submit task for evaluation
  const submitTask = useMutation({
    mutationFn: async ({ taskId, content, fileUrl }: { taskId: string; content: string; fileUrl?: string }) => {
      if (!userId || !cohortId) throw new Error('Missing user or cohort');
      
      // Check for existing submission
      const { data: existing, error: checkError } = await supabase
        .from('acceleration_submissions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .maybeSingle();
      
      if (checkError) throw checkError;

      let submission;

      // If exists with REJECTED status, update it
      if (existing && existing.status === 'REJECTED') {
        const { data, error } = await supabase
          .from('acceleration_submissions')
          .update({
            content,
            file_url: fileUrl || null,
            status: 'PENDING',
            submitted_at: new Date().toISOString(),
            ai_feedback: null,
            admin_feedback: null,
            reviewed_at: null,
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        submission = data;
      } 
      // If exists with PENDING, block
      else if (existing && existing.status === 'PENDING') {
        throw new Error('SUBMISSION_PENDING');
      }
      // If exists with APPROVED, block
      else if (existing && existing.status === 'APPROVED') {
        throw new Error('SUBMISSION_APPROVED');
      }
      // Otherwise, create new submission
      else {
        const { data, error } = await supabase
          .from('acceleration_submissions')
          .insert({
            user_id: userId,
            task_id: taskId,
            cohort_id: cohortId,
            content,
            file_url: fileUrl || null,
            status: 'PENDING',
          })
          .select()
          .single();
        
        if (error) throw error;
        submission = data;
      }

      // Update last activity
      await supabase
        .from('acceleration_user_progress')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('cohort_id', cohortId);

      // Call edge function to evaluate
      const { error: evalError } = await supabase.functions.invoke('evaluate-submission', {
        body: { 
          submissionId: submission.id,
          locale: i18n.language // 'pt', 'en', ou 'es'
        },
      });

      if (evalError) {
        console.error('Evaluation error:', evalError);
        // Don't throw - submission was created, just couldn't evaluate yet
      }

      return submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-submissions', userId, cohortId] });
      queryClient.invalidateQueries({ queryKey: ['acceleration-progress', userId, cohortId] });
      toast.success('Submissão enviada para avaliação!');
    },
    onError: (error: any) => {
      if (error.message === 'SUBMISSION_PENDING') {
        toast.error('Você já tem uma submissão pendente para esta tarefa.');
      } else if (error.message === 'SUBMISSION_APPROVED') {
        toast.error('Esta tarefa já foi aprovada. Avance para o próximo dia!');
      } else if (error.code === '23505') {
        toast.error('Submissão duplicada. Recarregue a página.');
      } else {
        toast.error('Erro ao enviar submissão. Tente novamente.');
      }
      console.error('Submit error:', error);
    },
  });

  // Cancel pending submission to allow editing
  const cancelSubmission = useMutation({
    mutationFn: async (submissionId: string) => {
      if (!userId) throw new Error('Missing user');
      
      const { error } = await supabase
        .from('acceleration_submissions')
        .delete()
        .eq('id', submissionId)
        .eq('user_id', userId)
        .eq('status', 'PENDING');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-submissions', userId, cohortId] });
      toast.success('Submissão cancelada. Você pode editar e reenviar.');
    },
    onError: () => {
      toast.error('Erro ao cancelar submissão.');
    },
  });

  // Get submission status by day
  const getSubmissionByDay = (dayNumber: number): AccelerationSubmission | null => {
    if (!submissions) return null;
    return submissions.find(s => s.task?.day_number === dayNumber) || null;
  };

  // Get latest submission for a task
  const getLatestSubmissionForTask = (taskId: string): AccelerationSubmission | null => {
    if (!submissions) return null;
    return submissions.find(s => s.task_id === taskId) || null;
  };

  return {
    progress,
    submissions: submissions || [],
    progressLoading,
    submissionsLoading,
    progressError,
    initializeProgress,
    submitTask,
    cancelSubmission,
    getSubmissionByDay,
    getLatestSubmissionForTask,
    isInitialized: !!progress,
  };
};

export type { AccelerationProgress, AccelerationSubmission };
