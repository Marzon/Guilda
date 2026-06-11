/**
 * Centralized profile completeness check.
 * This is the SINGLE SOURCE OF TRUTH for determining if a user's profile is complete.
 * 
 * A profile is complete when:
 * 1. Has looking_for field set (auto-filled based on archetype during onboarding)
 * 2. Has stats that are not the default 0,0,0 (only for non-investors)
 * 
 * NOTE: Bio and avatar are now OPTIONAL to reduce onboarding friction.
 * Users are encouraged but not required to add them.
 */

export interface ProfileData {
  archetype?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any; // Json type from Supabase - we'll cast internally
  looking_for?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export const isProfileComplete = (profile: ProfileData | null | undefined): boolean => {
  if (!profile) return false;
  
  const isInvestor = profile.archetype === 'INVESTOR';
  
  // Check for default stats (only relevant for non-investors)
  // Stats are set to 0,0,0 by database trigger on profile creation
  // If stats are still 0,0,0, user hasn't completed the profile step
  const statsData = profile.stats as { code?: number; design?: number; marketing?: number } | null;
  const hasDefaultStats = !isInvestor && 
    statsData?.code === 0 && 
    statsData?.design === 0 && 
    statsData?.marketing === 0;
  
  // looking_for is auto-populated during onboarding, so if missing = not completed
  const hasLookingFor = !!profile.looking_for;
  
  // Profile is complete if:
  // - No default stats (or is investor)
  // - Has looking_for set
  // Bio and avatar are now OPTIONAL to reduce friction
  return !hasDefaultStats && hasLookingFor;
};

/**
 * Returns specific reasons why a profile is incomplete.
 * Useful for debugging and showing users what they need to complete.
 */
export const getProfileIncompleteReasons = (profile: ProfileData | null | undefined): string[] => {
  if (!profile) return ['no_profile'];
  
  const reasons: string[] = [];
  const isInvestor = profile.archetype === 'INVESTOR';
  
  const statsData = profile.stats as { code?: number; design?: number; marketing?: number } | null;
  if (!isInvestor && statsData?.code === 0 && statsData?.design === 0 && statsData?.marketing === 0) {
    reasons.push('default_stats');
  }
  
  if (!profile.looking_for) {
    reasons.push('no_looking_for');
  }
  
  return reasons;
};
