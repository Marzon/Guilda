import { useState, useEffect, useCallback } from 'react';

interface UseOnlineStatusOptions {
  onReconnect?: () => void;
}

export const useOnlineStatus = (options?: UseOnlineStatusOptions) => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // Verificação ativa de conectividade
  const verifyConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors'
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let wasOfflineBefore = false;

    const handleOnline = () => {
      setIsOnline(true);
      
      // Trigger reconnect callback if coming back online
      if (wasOfflineBefore && options?.onReconnect) {
        options.onReconnect();
      }
      wasOfflineBefore = false;
    };

    const handleOffline = async () => {
      // Delay antes de confirmar offline (evita falsos alarmes)
      timeoutId = setTimeout(async () => {
        const hasConnection = await verifyConnectivity();
        setIsOnline(hasConnection);
        if (!hasConnection) {
          wasOfflineBefore = true;
        }
      }, 2000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [verifyConnectivity, options]);

  return isOnline;
};
