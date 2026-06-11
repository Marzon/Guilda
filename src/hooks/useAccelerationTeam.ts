import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AssignedTo = 'builder' | 'seller' | 'both';

export interface TeamMember {
  id: string;
  username: string;
  avatar_url: string | null;
  archetype: 'BUILDER' | 'SELLER';
}

export interface AccelerationTeam {
  id: string;
  cohort_id: string;
  startup_name: string;
  builder_id: string | null;
  seller_id: string | null;
  builder: TeamMember | null;
  seller: TeamMember | null;
  checklist_progress: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  team_id: string;
  task_id: string;
  assigned_to: AssignedTo;
  assigned_by: string | null;
  created_at: string;
}

export const useAccelerationTeam = (userId: string | null, cohortId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch team for the current user
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['acceleration-team', userId, cohortId],
    queryFn: async (): Promise<AccelerationTeam | null> => {
      if (!userId || !cohortId) return null;

      // Find team where user is builder or seller
      const { data: teamData, error } = await supabase
        .from('acceleration_teams')
        .select('*')
        .eq('cohort_id', cohortId)
        .or(`builder_id.eq.${userId},seller_id.eq.${userId}`)
        .maybeSingle();

      if (error) throw error;
      if (!teamData) return null;

      // Fetch member profiles
      const memberIds = [teamData.builder_id, teamData.seller_id].filter(Boolean) as string[];
      
      let builder: TeamMember | null = null;
      let seller: TeamMember | null = null;

      if (memberIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, archetype')
          .in('id', memberIds);

        if (profiles) {
          builder = profiles.find(p => p.id === teamData.builder_id) as TeamMember | null;
          seller = profiles.find(p => p.id === teamData.seller_id) as TeamMember | null;
        }
      }

      return {
        ...teamData,
        builder,
        seller,
        checklist_progress: teamData.checklist_progress || [],
      } as AccelerationTeam;
    },
    enabled: !!userId && !!cohortId,
  });

  // Fetch task assignments for the team
  const { data: taskAssignments = [] } = useQuery({
    queryKey: ['acceleration-task-assignments', team?.id],
    queryFn: async (): Promise<TaskAssignment[]> => {
      if (!team?.id) return [];

      const { data, error } = await supabase
        .from('acceleration_task_assignments')
        .select('*')
        .eq('team_id', team.id);

      if (error) throw error;
      return data as TaskAssignment[];
    },
    enabled: !!team?.id,
  });

  // Update startup name
  const updateStartupName = useMutation({
    mutationFn: async (newName: string) => {
      if (!team?.id) throw new Error('No team found');

      const { error } = await supabase
        .from('acceleration_teams')
        .update({ startup_name: newName })
        .eq('id', team.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-team', userId, cohortId] });
      toast.success('Nome da startup atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar nome da startup');
    },
  });

  // Update memorandum
  const updateMemorandum = useMutation({
    mutationFn: async (memorandum: string) => {
      if (!team?.id) throw new Error('No team found');

      const { error } = await supabase
        .from('acceleration_teams')
        .update({ memorandum })
        .eq('id', team.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-team', userId, cohortId] });
      toast.success('Memorando atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar memorando');
    },
  });

  // Update checklist progress
  const updateChecklistProgress = useMutation({
    mutationFn: async (checklistProgress: string[]) => {
      if (!team?.id) throw new Error('No team found');

      const { error } = await supabase
        .from('acceleration_teams')
        .update({ checklist_progress: checklistProgress })
        .eq('id', team.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-team', userId, cohortId] });
    },
    onError: () => {
      toast.error('Erro ao salvar progresso do checklist');
    },
  });
  const assignTask = useMutation({
    mutationFn: async ({ taskId, assignedTo }: { taskId: string; assignedTo: AssignedTo }) => {
      if (!team?.id || !userId) throw new Error('No team found');

      // Upsert the assignment
      const { error } = await supabase
        .from('acceleration_task_assignments')
        .upsert({
          team_id: team.id,
          task_id: taskId,
          assigned_to: assignedTo,
          assigned_by: userId,
        }, {
          onConflict: 'team_id,task_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceleration-task-assignments', team?.id] });
    },
    onError: () => {
      toast.error('Erro ao atribuir tarefa');
    },
  });

  // Get assignment for a specific task
  const getTaskAssignment = (taskId: string): AssignedTo => {
    const assignment = taskAssignments.find(a => a.task_id === taskId);
    return assignment?.assigned_to || 'both';
  };

  // Check if current user is assigned to a task
  const isUserAssigned = (taskId: string): boolean => {
    if (!team || !userId) return true; // Solo user, always assigned
    
    const assignment = getTaskAssignment(taskId);
    const isBuilder = team.builder_id === userId;
    const isSeller = team.seller_id === userId;

    if (assignment === 'both') return true;
    if (assignment === 'builder' && isBuilder) return true;
    if (assignment === 'seller' && isSeller) return true;
    
    return false;
  };

  // Get user's role in the team
  const getUserRole = (): 'builder' | 'seller' | null => {
    if (!team || !userId) return null;
    if (team.builder_id === userId) return 'builder';
    if (team.seller_id === userId) return 'seller';
    return null;
  };

  return {
    team,
    teamLoading,
    taskAssignments,
    updateStartupName,
    updateMemorandum,
    updateChecklistProgress,
    assignTask,
    getTaskAssignment,
    isUserAssigned,
    getUserRole,
    hasTeam: !!team,
  };
};

export type { AccelerationTeam as Team };
