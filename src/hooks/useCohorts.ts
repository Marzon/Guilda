// Stub hook for marketing site - returns static cohort data

export type CohortStatus = "PLANNED" | "OPEN" | "IN_PROGRESS" | "COMPLETED";
export type CohortMemberStatus = "ENROLLED" | "ACTIVE" | "DROPPED" | "REMOVED" | "GRADUATED";

export const COHORT_STATUS_LABELS: Record<CohortStatus, string> = {
  PLANNED: "Planejado",
  OPEN: "Aberto",
  IN_PROGRESS: "Andamento",
  COMPLETED: "Concluído",
};

export const COHORT_STATUS_COLORS: Record<CohortStatus, { badge: string; card: string }> = {
  PLANNED: { badge: "bg-slate-500 hover:bg-slate-600", card: "border-slate-200 bg-slate-50/50" },
  OPEN: { badge: "bg-green-500 hover:bg-green-600", card: "border-green-200 bg-green-50/30" },
  IN_PROGRESS: { badge: "bg-blue-500 hover:bg-blue-600", card: "border-blue-200 bg-blue-50/30" },
  COMPLETED: { badge: "bg-purple-500 hover:bg-purple-600", card: "border-purple-200 bg-purple-50/30" },
};

export interface Cohort {
  id: string;
  name: string;
  start_date: string;
  status: CohortStatus;
  whatsapp_link: string | null;
  max_slots: number | null;
  created_at: string;
  updated_at: string;
  members_count?: number;
  builders_count?: number;
  sellers_count?: number;
}

// Static placeholder cohort for marketing
const PLACEHOLDER_COHORT: Cohort = {
  id: "placeholder",
  name: "Próximo Ciclo",
  start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
  status: "OPEN",
  whatsapp_link: null,
  max_slots: 30,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  members_count: 18,
  builders_count: 9,
  sellers_count: 9,
};

export function useCohorts() {
  const cohorts = [PLACEHOLDER_COHORT];
  const openCohorts = cohorts.filter((c) => c.status === "OPEN");

  return {
    cohorts,
    openCohorts,
    isLoading: false,
    createCohort: { mutate: () => {}, isPending: false },
    updateCohort: { mutate: () => {}, isPending: false },
    deleteCohort: { mutate: () => {}, isPending: false },
  };
}
