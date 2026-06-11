import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

type EventType = 'page_view' | 'calculation' | 'download' | 'share';

const SESSION_KEY = 'guilda_tool_session_id';
const RECENT_TOOLS_KEY = 'guilda_recent_tools';
const MAX_RECENT_TOOLS = 10;
const DEBOUNCE_MS = 2000; // 2 seconds debounce for calculation events

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getReferrer = (): string => {
  const ref = document.referrer;
  if (!ref) return 'direct';
  try {
    const url = new URL(ref);
    if (url.hostname.includes('google')) return 'google';
    if (url.hostname.includes('linkedin')) return 'linkedin';
    if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) return 'twitter';
    if (url.hostname.includes('facebook')) return 'facebook';
    if (url.hostname.includes('guilda')) return 'internal';
    return url.hostname;
  } catch {
    return 'unknown';
  }
};

const saveRecentTool = (toolId: string) => {
  try {
    const stored = localStorage.getItem(RECENT_TOOLS_KEY);
    let tools: string[] = stored ? JSON.parse(stored) : [];
    
    // Remove se já existir (para mover para o topo)
    tools = tools.filter(t => t !== toolId);
    
    // Adiciona no início
    tools.unshift(toolId);
    
    // Limita a 10 ferramentas
    tools = tools.slice(0, MAX_RECENT_TOOLS);
    
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(tools));
  } catch {
    // Ignore localStorage errors
  }
};

export const useToolTracking = (toolName: string) => {
  const { data: auth } = useAuth();
  const hasTrackedPageView = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCalculationRef = useRef<Record<string, unknown> | null>(null);

  const trackEvent = useCallback(async (
    eventType: EventType,
    eventData?: Record<string, unknown>
  ) => {
    try {
      const sessionId = getSessionId();
      const deviceType = getDeviceType();
      const referrer = getReferrer();

      await supabase.from('tool_usage_events').insert([{
        tool_name: toolName,
        user_id: auth?.user?.id || null,
        session_id: sessionId,
        event_type: eventType,
        event_data: (eventData || {}) as Json,
        device_type: deviceType,
        referrer: referrer
      }]);
    } catch (error) {
      console.error('Error tracking tool event:', error);
    }
  }, [toolName, auth?.user?.id]);

  const trackPageView = useCallback(() => {
    trackEvent('page_view');
  }, [trackEvent]);

  // Debounced calculation tracking - waits for user to stop interacting
  const trackCalculation = useCallback((inputs?: Record<string, unknown>) => {
    // Store the latest inputs
    pendingCalculationRef.current = inputs || {};
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer - only fires after user stops changing values
    debounceTimerRef.current = setTimeout(() => {
      trackEvent('calculation', pendingCalculationRef.current || {});
      pendingCalculationRef.current = null;
    }, DEBOUNCE_MS);
  }, [trackEvent]);

  const trackDownload = useCallback((format?: string) => {
    trackEvent('download', { format });
  }, [trackEvent]);

  const trackShare = useCallback((platform?: string) => {
    trackEvent('share', { platform });
  }, [trackEvent]);

  // Auto-track page view on mount and save to recent tools
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      trackPageView();
      saveRecentTool(toolName);
    }
  }, [trackPageView, toolName]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    trackCalculation,
    trackDownload,
    trackShare
  };
};