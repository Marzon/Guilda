import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

export type DealTag = 'LEAD' | 'CONTATO' | 'DOCS' | 'ANALISANDO' | 'FECHADO' | 'PASSOU';
export type DealPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Deal {
  id: string;
  investor_id: string;
  founder_id: string;
  project_id: string | null;
  tags: DealTag[];
  notes: string | null;
  priority: DealPriority;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export const DEAL_TAGS: { value: DealTag; labelKey: string; color: string }[] = [
  { value: 'LEAD', labelKey: 'dealFlow.tags.LEAD', color: 'bg-blue-500' },
  { value: 'CONTATO', labelKey: 'dealFlow.tags.CONTATO', color: 'bg-yellow-500' },
  { value: 'DOCS', labelKey: 'dealFlow.tags.DOCS', color: 'bg-orange-500' },
  { value: 'ANALISANDO', labelKey: 'dealFlow.tags.ANALISANDO', color: 'bg-purple-500' },
  { value: 'FECHADO', labelKey: 'dealFlow.tags.FECHADO', color: 'bg-green-500' },
  { value: 'PASSOU', labelKey: 'dealFlow.tags.PASSOU', color: 'bg-gray-500' },
];

export const DEAL_PRIORITIES: { value: DealPriority; labelKey: string; icon: string }[] = [
  { value: 'LOW', labelKey: 'dealFlow.priority.LOW', icon: '⬇️' },
  { value: 'MEDIUM', labelKey: 'dealFlow.priority.MEDIUM', icon: '➡️' },
  { value: 'HIGH', labelKey: 'dealFlow.priority.HIGH', icon: '⬆️' },
  { value: 'URGENT', labelKey: 'dealFlow.priority.URGENT', icon: '🔥' },
];

export const useDealFlow = () => {
  const { data: authData } = useAuth();
  const user = authData?.user;
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Fetch all deals for the investor
  const { data: deals = [], isLoading, refetch } = useQuery({
    queryKey: ['investor-deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('investor_deals')
        .select('*')
        .eq('investor_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Deal[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Save a founder to the pipeline
  const saveDealMutation = useMutation({
    mutationFn: async ({ founderId, projectId }: { founderId: string; projectId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('investor_deals')
        .insert({
          investor_id: user.id,
          founder_id: founderId,
          project_id: projectId || null,
          tags: ['LEAD'],
          priority: 'MEDIUM',
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('already_saved');
        }
        throw error;
      }
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-deals'] });
      toast.success(t('dealFlow.actions.saved', 'Salvo no pipeline'));
    },
    onError: (error: Error) => {
      if (error.message === 'already_saved') {
        toast.info(t('dealFlow.alreadySaved', 'Já está no seu pipeline'));
      } else {
        toast.error(t('error.generic', 'Erro ao salvar'));
      }
    },
  });

  // Remove a deal from the pipeline
  const removeDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from('investor_deals')
        .delete()
        .eq('id', dealId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-deals'] });
      setSelectedDealId(null);
      toast.success(t('dealFlow.removed', 'Removido do pipeline'));
    },
    onError: () => {
      toast.error(t('error.generic', 'Erro ao remover'));
    },
  });

  // Update deal tags
  const updateTagsMutation = useMutation({
    mutationFn: async ({ dealId, tags }: { dealId: string; tags: DealTag[] }) => {
      const { data, error } = await supabase
        .from('investor_deals')
        .update({ tags })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-deals'] });
    },
    onError: () => {
      toast.error(t('error.generic', 'Erro ao atualizar tags'));
    },
  });

  // Update deal notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ dealId, notes }: { dealId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('investor_deals')
        .update({ notes })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-deals'] });
      toast.success(t('dealFlow.notesSaved', 'Notas salvas'));
    },
    onError: () => {
      toast.error(t('error.generic', 'Erro ao salvar notas'));
    },
  });

  // Update deal priority
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ dealId, priority }: { dealId: string; priority: DealPriority }) => {
      const { data, error } = await supabase
        .from('investor_deals')
        .update({ priority })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-deals'] });
    },
    onError: () => {
      toast.error(t('error.generic', 'Erro ao atualizar prioridade'));
    },
  });

  // Check if a founder is saved
  const isDealSaved = useCallback((founderId: string): boolean => {
    return deals.some(deal => deal.founder_id === founderId);
  }, [deals]);

  // Get deal for a specific founder
  const getDealForFounder = useCallback((founderId: string): Deal | undefined => {
    return deals.find(deal => deal.founder_id === founderId);
  }, [deals]);

  // Get deals by founder IDs (for batch lookup)
  const dealsByFounderId = useMemo(() => {
    const map = new Map<string, Deal>();
    deals.forEach(deal => {
      map.set(deal.founder_id, deal);
    });
    return map;
  }, [deals]);

  // Close a deal (mark as won or passed)
  const closeDeal = useCallback(async (dealId: string, won: boolean) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    
    const filteredTags = deal.tags.filter(t => t !== 'FECHADO' && t !== 'PASSOU');
    const closeTag: DealTag = won ? 'FECHADO' : 'PASSOU';
    const newTags: DealTag[] = [...filteredTags, closeTag];
    
    await updateTagsMutation.mutateAsync({ dealId, tags: newTags });
    toast.success(won ? t('dealFlow.markedWon', 'Deal fechado!') : t('dealFlow.markedPassed', 'Deal descartado'));
  }, [deals, updateTagsMutation, t]);

  return {
    deals,
    isLoading,
    refetch,
    selectedDealId,
    setSelectedDealId,
    saveDeal: saveDealMutation.mutate,
    saveDealAsync: saveDealMutation.mutateAsync,
    isSaving: saveDealMutation.isPending,
    removeDeal: removeDealMutation.mutate,
    isRemoving: removeDealMutation.isPending,
    updateTags: updateTagsMutation.mutate,
    updateTagsAsync: updateTagsMutation.mutateAsync,
    updateNotes: updateNotesMutation.mutate,
    updateNotesAsync: updateNotesMutation.mutateAsync,
    updatePriority: updatePriorityMutation.mutate,
    isDealSaved,
    getDealForFounder,
    dealsByFounderId,
    closeDeal,
  };
};
