import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface AccelerationPhase {
  id: string;
  cohort_id: string | null;
  phase_number: number;
  name: string;
  description: string | null;
  start_day: number;
  end_day: number;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  tasks?: AccelerationTask[];
}

export interface AccelerationTask {
  id: string;
  phase_id: string;
  day_number: number;
  title: string;
  description: string;
  deliverable_format: "text" | "file" | "url" | "both";
  evaluation_criteria: string | null;
  order_index: number;
  is_required: boolean;
  recommended_tools: string[];
  recommended_articles: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePhaseData {
  cohort_id: string;
  phase_number: number;
  name: string;
  description?: string;
  start_day: number;
  end_day: number;
  icon?: string;
  color?: string;
}

export interface CreateTaskData {
  phase_id: string;
  day_number: number;
  title: string;
  description: string;
  deliverable_format?: "text" | "file" | "url" | "both";
  evaluation_criteria?: string;
  order_index?: number;
  is_required?: boolean;
  recommended_tools?: string[];
  recommended_articles?: string[];
}

export function useAccelerationPhases(cohortId: string | null) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: phases = [], isLoading } = useQuery({
    queryKey: ["acceleration-phases", cohortId],
    enabled: !!cohortId,
    queryFn: async () => {
      if (!cohortId) return [];

      const { data, error } = await supabase
        .from("acceleration_phases")
        .select(`
          *,
          tasks:acceleration_tasks(*)
        `)
        .eq("cohort_id", cohortId)
        .order("phase_number", { ascending: true });

      if (error) throw error;

      return (data || []).map((phase) => ({
        ...phase,
        tasks: (phase.tasks || []).sort((a, b) => 
          a.day_number === b.day_number 
            ? a.order_index - b.order_index 
            : a.day_number - b.day_number
        ).map(task => ({
          ...task,
          deliverable_format: task.deliverable_format as "text" | "file" | "url" | "both",
          recommended_tools: task.recommended_tools || [],
          recommended_articles: task.recommended_articles || [],
        })),
      })) as AccelerationPhase[];
    },
  });

  const createPhase = useMutation({
    mutationFn: async (data: CreatePhaseData) => {
      const { error } = await supabase.from("acceleration_phases").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-phases", cohortId] });
      toast.success(t("admin.schedule.phaseCreated", "Fase criada com sucesso"));
    },
    onError: (error) => {
      toast.error(t("admin.schedule.phaseCreateError", "Erro ao criar fase") + ": " + error.message);
    },
  });

  const updatePhase = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AccelerationPhase> & { id: string }) => {
      const { error } = await supabase
        .from("acceleration_phases")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-phases", cohortId] });
      toast.success(t("admin.schedule.phaseUpdated", "Fase atualizada com sucesso"));
    },
    onError: (error) => {
      toast.error(t("admin.schedule.phaseUpdateError", "Erro ao atualizar fase") + ": " + error.message);
    },
  });

  const deletePhase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("acceleration_phases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-phases", cohortId] });
      toast.success(t("admin.schedule.phaseDeleted", "Fase removida com sucesso"));
    },
    onError: (error) => {
      toast.error(t("admin.schedule.phaseDeleteError", "Erro ao remover fase") + ": " + error.message);
    },
  });

  return {
    phases,
    isLoading,
    createPhase,
    updatePhase,
    deletePhase,
  };
}

export function useAccelerationTasks(phaseId: string | null) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["acceleration-tasks", phaseId],
    enabled: !!phaseId,
    queryFn: async () => {
      if (!phaseId) return [];

      const { data, error } = await supabase
        .from("acceleration_tasks")
        .select("*")
        .eq("phase_id", phaseId)
        .order("day_number", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as AccelerationTask[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { error } = await supabase.from("acceleration_tasks").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-tasks", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["acceleration-phases"] });
      toast.success(t("admin.schedule.taskCreated", "Tarefa criada com sucesso"));
    },
    onError: (error) => {
      toast.error(t("admin.schedule.taskCreateError", "Erro ao criar tarefa") + ": " + error.message);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AccelerationTask> & { id: string }) => {
      const { error } = await supabase
        .from("acceleration_tasks")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-tasks", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["acceleration-phases"] });
      toast.success(t("admin.schedule.taskUpdated", "Tarefa atualizada com sucesso"));
    },
    onError: (error) => {
      toast.error(t("admin.schedule.taskUpdateError", "Erro ao atualizar tarefa") + ": " + error.message);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("acceleration_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-tasks", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["acceleration-phases"] });
      toast.success(t("admin.schedule.taskDeleted", "Tarefa removida com sucesso"));
    },
    onError: (error) => {
      toast.error(t("admin.schedule.taskDeleteError", "Erro ao remover tarefa") + ": " + error.message);
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  };
}
