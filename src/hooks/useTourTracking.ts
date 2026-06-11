import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { trackEvent as trackGA } from '@/lib/analytics';
import type { Json } from '@/integrations/supabase/types';

type TourEventType = 
  | 'prompt_shown'
  | 'tour_started'
  | 'tour_skipped'
  | 'step_viewed'
  | 'tour_completed'
  | 'tour_abandoned';

// Session ID persists for the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('tour_session_id');
  if (!sessionId) {
    sessionId = `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tour_session_id', sessionId);
  }
  return sessionId;
};

const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getReferrer = (): string => {
  return document.referrer || 'direct';
};

export const useTourTracking = (tourName: string) => {
  const { data: auth } = useAuth();
  const startTimeRef = useRef<number>(0);
  const trackedStepsRef = useRef<Set<number>>(new Set());
  const currentStepRef = useRef<number>(0);

  const trackEvent = useCallback(async (
    eventType: TourEventType,
    stepNumber: number = 0,
    stepName?: string,
    eventData?: Record<string, Json>
  ) => {
    try {
      // Insert to database
      await supabase.from('tour_events').insert([{
        tour_name: tourName,
        user_id: auth?.user?.id || null,
        session_id: getSessionId(),
        event_type: eventType,
        step_number: stepNumber,
        step_name: stepName || null,
        event_data: eventData || {},
        device_type: getDeviceType(),
        referrer: getReferrer(),
      }]);

      // Also send to GA4
      trackGA(
        `tour_${eventType}`, 
        'tours', 
        `${tourName}_${stepName || `step_${stepNumber}`}`
      );
    } catch (error) {
      console.error('[TourTracking] Error tracking event:', error);
    }
  }, [tourName, auth?.user?.id]);

  const trackPromptShown = useCallback(() => {
    trackEvent('prompt_shown');
  }, [trackEvent]);

  const trackTourStarted = useCallback((autoStart: boolean) => {
    startTimeRef.current = Date.now();
    trackedStepsRef.current.clear();
    currentStepRef.current = 0;
    trackEvent('tour_started', 0, undefined, { auto_start: autoStart });
  }, [trackEvent]);

  const trackTourSkipped = useCallback(() => {
    trackEvent('tour_skipped');
  }, [trackEvent]);

  const trackStepViewed = useCallback((stepNumber: number, stepName: string) => {
    // Only track each step once per tour session
    if (!trackedStepsRef.current.has(stepNumber)) {
      trackedStepsRef.current.add(stepNumber);
      currentStepRef.current = stepNumber;
      trackEvent('step_viewed', stepNumber, stepName);
    }
  }, [trackEvent]);

  const trackTourCompleted = useCallback((totalSteps: number) => {
    const duration = Date.now() - startTimeRef.current;
    trackEvent('tour_completed', totalSteps, undefined, { 
      total_steps: totalSteps, 
      duration_ms: duration 
    });
  }, [trackEvent]);

  const trackTourAbandoned = useCallback((lastStep: number, lastStepName?: string) => {
    const duration = Date.now() - startTimeRef.current;
    trackEvent('tour_abandoned', lastStep, lastStepName, { 
      last_step: lastStep,
      duration_ms: duration
    });
  }, [trackEvent]);

  return {
    trackPromptShown,
    trackTourStarted,
    trackTourSkipped,
    trackStepViewed,
    trackTourCompleted,
    trackTourAbandoned,
    getCurrentStep: () => currentStepRef.current,
  };
};
