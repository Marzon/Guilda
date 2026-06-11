import { useState, useEffect, useCallback } from "react";

const FIRST_MATCH_KEY = "guilda_first_match_sent";
const NUDGE_DISMISSED_KEY = "guilda_first_match_nudge_dismissed";

export const useFirstMatch = (userId: string | null) => {
  const [hasSentFirstMatch, setHasSentFirstMatch] = useState(true);
  const [nudgeDismissed, setNudgeDismissed] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    // Check localStorage for first match status
    const key = `${FIRST_MATCH_KEY}_${userId}`;
    const dismissKey = `${NUDGE_DISMISSED_KEY}_${userId}`;
    
    const sent = localStorage.getItem(key) === "true";
    const dismissed = localStorage.getItem(dismissKey) === "true";
    
    setHasSentFirstMatch(sent);
    setNudgeDismissed(dismissed);
  }, [userId]);

  const markFirstMatchSent = useCallback(() => {
    if (!userId) return;
    
    const key = `${FIRST_MATCH_KEY}_${userId}`;
    const wasPreviouslySent = localStorage.getItem(key) === "true";
    
    if (!wasPreviouslySent) {
      localStorage.setItem(key, "true");
      setHasSentFirstMatch(true);
      setShowCelebration(true);
      
      // Hide celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [userId]);

  const dismissNudge = useCallback(() => {
    if (!userId) return;
    
    const dismissKey = `${NUDGE_DISMISSED_KEY}_${userId}`;
    localStorage.setItem(dismissKey, "true");
    setNudgeDismissed(true);
  }, [userId]);

  const showNudge = !hasSentFirstMatch && !nudgeDismissed;

  return {
    hasSentFirstMatch,
    showNudge,
    showCelebration,
    markFirstMatchSent,
    dismissNudge,
  };
};
