import { useState, useEffect, useCallback } from "react";

const LOGIN_COUNT_KEY = "login_count";
const PUSH_PROMPT_COMPLETED_KEY = "push_prompt_completed";
const PUSH_PROMPT_LAST_ASKED_KEY = "push_prompt_last_asked";
const LOGIN_INTERVAL_FOR_PROMPT = 3;

export const usePushPrompt = () => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  // Check if we should show the push prompt
  const checkShouldPrompt = useCallback(() => {
    // Don't show if push is not supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return false;
    }

    // Don't show if already granted or denied
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return false;
    }

    // Don't show if user already completed the prompt
    const promptCompleted = localStorage.getItem(PUSH_PROMPT_COMPLETED_KEY);
    if (promptCompleted === "true") {
      return false;
    }

    const loginCount = parseInt(localStorage.getItem(LOGIN_COUNT_KEY) || "0", 10);
    const lastAskedAt = parseInt(localStorage.getItem(PUSH_PROMPT_LAST_ASKED_KEY) || "0", 10);

    // Show on first login (loginCount === 1)
    if (loginCount === 1 && lastAskedAt === 0) {
      return true;
    }

    // Show every 3 logins after user skipped
    if (lastAskedAt > 0 && loginCount - lastAskedAt >= LOGIN_INTERVAL_FOR_PROMPT) {
      return true;
    }

    return false;
  }, []);

  // Increment login count - call this on successful login
  const incrementLoginCount = useCallback(() => {
    const currentCount = parseInt(localStorage.getItem(LOGIN_COUNT_KEY) || "0", 10);
    const newCount = currentCount + 1;
    localStorage.setItem(LOGIN_COUNT_KEY, newCount.toString());
    
    // Check if we should show prompt after incrementing
    setTimeout(() => {
      if (checkShouldPrompt()) {
        setShouldShowPrompt(true);
      }
    }, 1000); // Small delay to let the page load
  }, [checkShouldPrompt]);

  // Mark prompt as shown (user either enabled or skipped)
  const markPromptShown = useCallback(() => {
    setShouldShowPrompt(false);
  }, []);

  // Check on mount if we should show (for page refresh scenarios)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkShouldPrompt()) {
        setShouldShowPrompt(true);
      }
    }, 2000); // Delay to let everything initialize

    return () => clearTimeout(timer);
  }, [checkShouldPrompt]);

  return {
    shouldShowPrompt,
    setShouldShowPrompt,
    incrementLoginCount,
    markPromptShown,
  };
};
