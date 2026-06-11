import { useMemo } from "react";
import { useMatches } from "@/hooks/useMatches";
import { useMyProjects } from "@/hooks/useMyProjects";
import { ADMIN_USER_ID } from "@/lib/constants";

export type LockReason = "no_team" | null;

interface UseCanContactInvestorResult {
  canContact: boolean;
  hasAcceptedMatch: boolean;
  hasProject: boolean;
  reason: LockReason;
  isLoading: boolean;
}

export const useCanContactInvestor = (userId: string | undefined): UseCanContactInvestorResult => {
  const { matches, isLoading: loadingMatches } = useMatches(userId ?? null);
  const { allProjects, isLoading: loadingProjects } = useMyProjects();

  // Admin bypass - admin can contact anyone
  const isAdmin = userId === ADMIN_USER_ID;

  const hasAcceptedMatch = useMemo(() => {
    return matches?.some((m) => m.status === "ACCEPTED") ?? false;
  }, [matches]);

  const hasProject = useMemo(() => {
    return allProjects.length > 0;
  }, [allProjects]);

  const canContact = isAdmin || hasAcceptedMatch || hasProject;

  const reason = useMemo((): LockReason => {
    if (canContact) return null;
    return "no_team";
  }, [canContact]);

  return {
    canContact,
    hasAcceptedMatch,
    hasProject,
    reason,
    isLoading: loadingMatches || loadingProjects,
  };
};
