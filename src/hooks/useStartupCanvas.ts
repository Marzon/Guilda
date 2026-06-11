import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CanvasSubmission {
  id: string;
  content: string;
  file_url: string | null;
  ai_feedback: string | null;
  submitted_at: string;
  task: {
    id: string;
    day_number: number;
    title: string;
    description: string | null;
    deliverable_format: string | null;
  };
  phase: {
    id: string;
    name: string;
    color: string | null;
    phase_number: number;
  };
}

export interface CanvasPhase {
  id: string;
  name: string;
  color: string | null;
  phase_number: number;
  submissions: CanvasSubmission[];
  completedDays: number;
  totalDays: number;
}

export const useStartupCanvas = (userId: string | null, cohortId: string | null) => {
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["startup-canvas", userId, cohortId],
    queryFn: async () => {
      if (!userId || !cohortId) return [];

      const { data, error } = await supabase
        .from("acceleration_submissions")
        .select(`
          id,
          content,
          file_url,
          ai_feedback,
          submitted_at,
          task:acceleration_tasks(
            id,
            day_number,
            title,
            description,
            deliverable_format,
            phase:acceleration_phases(
              id,
              name,
              color,
              phase_number
            )
          )
        `)
        .eq("user_id", userId)
        .eq("status", "APPROVED")
        .order("submitted_at", { ascending: true });

      if (error) throw error;

      // Transform the data to flatten the structure
      return (data || []).map((submission: any) => ({
        id: submission.id,
        content: submission.content,
        file_url: submission.file_url,
        ai_feedback: submission.ai_feedback,
        submitted_at: submission.submitted_at,
        task: {
          id: submission.task.id,
          day_number: submission.task.day_number,
          title: submission.task.title,
          description: submission.task.description,
          deliverable_format: submission.task.deliverable_format,
        },
        phase: {
          id: submission.task.phase.id,
          name: submission.task.phase.name,
          color: submission.task.phase.color,
          phase_number: submission.task.phase.phase_number,
        },
      })) as CanvasSubmission[];
    },
    enabled: !!userId && !!cohortId,
  });

  // Fetch all phases for this cohort to show total days
  const { data: phases = [] } = useQuery({
    queryKey: ["startup-canvas-phases", cohortId],
    queryFn: async () => {
      if (!cohortId) return [];

      const { data, error } = await supabase
        .from("acceleration_phases")
        .select(`
          id,
          name,
          color,
          phase_number,
          tasks:acceleration_tasks(id, day_number)
        `)
        .eq("cohort_id", cohortId)
        .order("phase_number", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!cohortId,
  });

  // Group submissions by phase
  const groupedByPhase: CanvasPhase[] = phases.map((phase: any) => {
    const phaseSubmissions = submissions.filter(
      (s) => s.phase.id === phase.id
    ).sort((a, b) => a.task.day_number - b.task.day_number);

    return {
      id: phase.id,
      name: phase.name,
      color: phase.color,
      phase_number: phase.phase_number,
      submissions: phaseSubmissions,
      completedDays: phaseSubmissions.length,
      totalDays: phase.tasks?.length || 0,
    };
  });

  const totalCompletedDays = submissions.length;
  const totalDays = phases.reduce((sum: number, p: any) => sum + (p.tasks?.length || 0), 0);

  return {
    submissions,
    groupedByPhase,
    totalCompletedDays,
    totalDays,
    isLoading: submissionsLoading,
  };
};
