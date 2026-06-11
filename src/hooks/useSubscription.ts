// Stub hook for marketing site - always returns non-premium
export const useSubscription = (userId: string | null) => {
  return {
    tier: 'FREE' as "FREE" | "ADVENTURER" | "FOUNDER" | "ALPHA" | "BASIC",
    isPremium: false,
    dailyMatchesRemaining: 1,
    canSendMatch: true,
    monthlyMessagesRemaining: 100,
    canSendMessage: true,
    projectsCount: 0,
    maxProjects: 1,
    canCreateProject: true,
    loading: false,
    refresh: () => {},
  };
};
