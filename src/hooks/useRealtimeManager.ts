import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeManager, ConnectionStatus } from '@/services/RealtimeManager';

export const useRealtimeManager = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const managerRef = useRef(realtimeManager);

  useEffect(() => {
    const unsubscribe = managerRef.current.onStatusChange(setConnectionStatus);
    return unsubscribe;
  }, []);

  const subscribe = useCallback(
    (...args: Parameters<typeof realtimeManager.subscribe>) => {
      return managerRef.current.subscribe(...args);
    },
    []
  );

  const unsubscribe = useCallback(
    (channelName: string) => {
      managerRef.current.unsubscribe(channelName);
    },
    []
  );

  return {
    connectionStatus,
    subscribe,
    unsubscribe,
    isConnected: connectionStatus === 'connected',
    isReconnecting: connectionStatus === 'reconnecting',
    isDisconnected: connectionStatus === 'disconnected',
  };
};
