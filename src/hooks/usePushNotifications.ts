/// <reference lib="webworker" />
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
      setIsSupported(supported);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      
      if (supported && Notification.permission === 'granted') {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length > 0) {
            const subscription = await registrations[0].pushManager.getSubscription();
            setIsSubscribed(!!subscription);
          }
        } catch (error) {
          console.error('[Push] Error checking subscription:', error);
        }
      }
    };
    
    checkSupport();
  }, []);

  const getVapidPublicKey = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      if (error) throw error;
      return data?.publicKey || null;
    } catch (error) {
      console.error('[Push] Error getting VAPID key:', error);
      return null;
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as Uint8Array<ArrayBuffer>;
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error(t('push.browserNotSupported'));
      return false;
    }

    setIsLoading(true);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== 'granted') {
        toast.error(t('push.permissionDenied'));
        return false;
      }

      const vapidPublicKey = await getVapidPublicKey();
      if (!vapidPublicKey) {
        toast.error(t('push.configError'));
        return false;
      }

      const getRegistration = async (): Promise<ServiceWorkerRegistration> => {
        // Use existing PWA service worker instead of registering a separate one
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        if (registrations.length > 0) {
          // Prefer the active SW from PWA
          const activeSW = registrations.find(r => r.active);
          if (activeSW) return activeSW;
          return registrations[0];
        }
        
        // If no SW registered yet, wait for PWA to register one
        console.log('[Push] Waiting for PWA service worker...');
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Service Worker timeout')), 10000);
        });
        return Promise.race([navigator.serviceWorker.ready, timeoutPromise]);
      };
      
      const registration = await getRegistration();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      };

      const { error } = await supabase.functions.invoke('register-push-subscription', {
        body: {
          subscription: subscriptionData,
          action: 'subscribe',
        },
      });

      if (error) {
        console.error('[Push] Error registering subscription:', error);
        throw error;
      }

      setIsSubscribed(true);
      toast.success(t('push.enabledSuccess'));
      return true;
    } catch (error) {
      console.error('[Push] Error subscribing to push:', error);
      
      // More specific error messages for debugging
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          toast.error(t('push.permissionDenied'));
        } else if (error.message.includes('subscription') || error.message.includes('push')) {
          toast.error(t('push.subscriptionError'));
        } else if (error.message.includes('timeout')) {
          toast.error(t('push.serviceWorkerTimeout'));
        } else {
          toast.error(t('push.enableError'));
        }
      } else {
        toast.error(t('push.enableError'));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, t]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        await supabase.functions.invoke('register-push-subscription', {
          body: {
            subscription: { endpoint: subscription.endpoint },
            action: 'unsubscribe',
          },
        });
      }

      setIsSubscribed(false);
      toast.success(t('push.disabledSuccess'));
      return true;
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      toast.error(t('push.disableError'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error(t('push.notificationsNotSupported'));
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success(t('push.grantedSuccess'));
        return true;
      } else if (result === 'denied') {
        toast.error(t('push.permissionDenied'));
        return false;
      }
      return false;
    } catch (error) {
      console.error('[Push] Error requesting permission:', error);
      return false;
    }
  }, [isSupported, t]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    if (document.hasFocus()) {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/favicon.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('[Push] Error showing notification:', error);
    }
  }, [isSupported, permission]);

  const playNotificationSound = useCallback((type: 'default' | 'message' | 'match' = 'default') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'message') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      } else if (type === 'match') {
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silent fail for audio
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission,
    showNotification,
    playNotificationSound,
    isGranted: permission === 'granted',
  };
};
