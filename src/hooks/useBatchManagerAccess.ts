import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook para gerenciar acesso de batch managers à jornada de aceleração.
 * 
 * Batch managers podem:
 * - Testar a jornada completa
 * - Testar as tarefas
 * 
 * Batch managers NÃO são:
 * - Listados como membros da turma
 * - Atribuídos a times
 */
export function useBatchManagerAccess(userId: string | null, cohortId: string | null) {
  const queryClient = useQueryClient();

  // Verifica se o usuário é batch manager desta cohort
  const { data: isBatchManager, isLoading: checkingBatchManager } = useQuery({
    queryKey: ['is-batch-manager', userId, cohortId],
    queryFn: async () => {
      if (!userId || !cohortId) return false;
      
      const { data, error } = await supabase
        .from('cohort_managers')
        .select('id')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking batch manager status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!userId && !!cohortId,
  });

  // Verifica se já existe progresso de teste para este batch manager
  const { data: testProgress = false, isLoading: loadingTestProgress } = useQuery({
    queryKey: ['batch-manager-progress', userId, cohortId, isBatchManager],
    queryFn: async () => {
      if (!userId || !cohortId) return false;
      
      // Use RPC or simple count to avoid type issues
      const result = await supabase
        .from('acceleration_user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .eq('is_test_user', true)
        .limit(1);
      
      return result.data && result.data.length > 0;
    },
    enabled: !!userId && !!cohortId && !!isBatchManager,
  });

  // Cria progresso de teste para batch manager
  const startTestMode = useMutation({
    mutationFn: async () => {
      if (!userId || !cohortId) throw new Error('Missing user or cohort');
      
      // Primeiro verifica se já existe
      const { data: existing } = await supabase
        .from('acceleration_user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .maybeSingle();
      
      if (existing) {
        // Atualiza para modo de teste
        const { data, error } = await supabase
          .from('acceleration_user_progress')
          .update({ 
            is_test_user: true,
            current_day: 1,
            status: 'ACTIVE',
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // Cria novo progresso de teste
      const { data, error } = await supabase
        .from('acceleration_user_progress')
        .insert({
          user_id: userId,
          cohort_id: cohortId,
          current_day: 1,
          status: 'ACTIVE',
          is_test_user: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-manager-progress', userId, cohortId] });
      queryClient.invalidateQueries({ queryKey: ['acceleration-progress', userId, cohortId] });
      toast.success('🧪 Modo de teste iniciado! Você pode testar a jornada completa.');
    },
    onError: (error) => {
      console.error('Error starting test mode:', error);
      toast.error('Erro ao iniciar modo de teste');
    },
  });

  // Reseta o progresso de teste
  const resetTestProgress = useMutation({
    mutationFn: async () => {
      if (!userId || !cohortId) throw new Error('Missing user or cohort');
      
      // 1. Remove a análise do Pivoter
      await supabase
        .from('acceleration_pivot_analysis')
        .delete()
        .eq('user_id', userId)
        .eq('cohort_id', cohortId);
      
      // 2. Remove todas as submissões de teste
      await supabase
        .from('acceleration_submissions')
        .delete()
        .eq('user_id', userId)
        .eq('cohort_id', cohortId);
      
      // 3. Reseta o progresso para dia 1
      const { error } = await supabase
        .from('acceleration_user_progress')
        .update({ 
          current_day: 1,
          status: 'ACTIVE',
          last_activity_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .eq('is_test_user', true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-manager-progress', userId, cohortId] });
      queryClient.invalidateQueries({ queryKey: ['acceleration-progress', userId, cohortId] });
      queryClient.invalidateQueries({ queryKey: ['acceleration-submissions', userId, cohortId] });
      queryClient.invalidateQueries({ queryKey: ['pivot-analysis', userId, cohortId] });
      toast.success('🔄 Progresso de teste resetado!');
    },
    onError: (error) => {
      console.error('Error resetting test progress:', error);
      toast.error('Erro ao resetar progresso');
    },
  });

  return {
    isBatchManager: isBatchManager ?? false,
    checkingBatchManager,
    testProgress: testProgress ?? false,
    loadingTestProgress,
    hasTestProgress: testProgress ?? false,
    startTestMode,
    resetTestProgress,
  };
}
