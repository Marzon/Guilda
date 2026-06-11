import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { trackEvent } from '@/lib/analytics';

type OnboardingEventType = 
  | 'step_viewed' 
  | 'step_completed' 
  | 'step_skipped' 
  | 'onboarding_completed' 
  | 'onboarding_abandoned';

export const STEP_NAMES = [
  'signup_source',
  'archetype', 
  'profile',
  'skills',
  'project',
  'tutorial',
  'confirmation'
] as const;

// Estimated time per step in seconds
const STEP_TIMES = [30, 20, 90, 60, 90, 30, 10];

const SESSION_KEY = 'guilda_onboarding_session_id';

const generateSessionId = () => {
  return `onb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getReferrer = (): string => {
  return document.referrer || 'direct';
};

export const useOnboardingTracking = (currentStep: number) => {
  const { data: auth } = useAuth();
  const trackedSteps = useRef<Set<number>>(new Set());
  const lastTrackedStep = useRef<number>(-1);

  const trackOnboardingEvent = useCallback(async (
    eventType: OnboardingEventType,
    stepNumber: number,
    eventData?: Record<string, unknown>
  ) => {
    const stepName = STEP_NAMES[stepNumber] || 'unknown';
    
    try {
      // Save to database
      await supabase.from('onboarding_events').insert([{
        user_id: auth?.user?.id || null,
        session_id: getSessionId(),
        event_type: eventType,
        step_number: stepNumber,
        step_name: stepName,
        event_data: (eventData || {}) as Record<string, unknown>,
        device_type: getDeviceType(),
        referrer: getReferrer(),
      }] as any);

      // Also send to Google Analytics
      trackEvent(
        `onboarding_${eventType}`, 
        'onboarding', 
        stepName, 
        stepNumber
      );
    } catch (error) {
      console.error('Failed to track onboarding event:', error);
    }
  }, [auth?.user?.id]);

  // Track step_viewed when step changes
  useEffect(() => {
    if (currentStep !== lastTrackedStep.current && !trackedSteps.current.has(currentStep)) {
      trackedSteps.current.add(currentStep);
      lastTrackedStep.current = currentStep;
      trackOnboardingEvent('step_viewed', currentStep);
    }
  }, [currentStep, trackOnboardingEvent]);

  // Track abandonment when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only track abandonment if not on the final step
      if (currentStep < STEP_NAMES.length - 1) {
        // Use sendBeacon for reliable tracking on page unload
        const payload = JSON.stringify({
          user_id: auth?.user?.id || null,
          session_id: getSessionId(),
          event_type: 'onboarding_abandoned',
          step_number: currentStep,
          step_name: STEP_NAMES[currentStep],
          device_type: getDeviceType(),
          referrer: getReferrer(),
        });
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/onboarding_events`,
          new Blob([payload], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, auth?.user?.id]);

  const trackStepCompleted = useCallback((step: number, data?: Record<string, unknown>) => {
    return trackOnboardingEvent('step_completed', step, data);
  }, [trackOnboardingEvent]);

  const trackStepSkipped = useCallback((step: number) => {
    return trackOnboardingEvent('step_skipped', step);
  }, [trackOnboardingEvent]);

  const trackOnboardingCompleted = useCallback(() => {
    // Clear session on completion
    sessionStorage.removeItem(SESSION_KEY);
    return trackOnboardingEvent('onboarding_completed', STEP_NAMES.length - 1);
  }, [trackOnboardingEvent]);

  const getTimeRemaining = useCallback((step: number): number => {
    const remaining = STEP_TIMES.slice(step).reduce((a, b) => a + b, 0);
    return Math.ceil(remaining / 60); // in minutes
  }, []);

  const getTotalSteps = useCallback(() => STEP_NAMES.length, []);

  return {
    trackStepCompleted,
    trackStepSkipped,
    trackOnboardingCompleted,
    getTimeRemaining,
    getTotalSteps,
  };
};
