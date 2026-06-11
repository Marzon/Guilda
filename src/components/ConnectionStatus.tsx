import { Loader2, WifiOff, Wifi } from 'lucide-react';
import { useRealtimeManager } from '@/hooks/useRealtimeManager';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect, useState, useRef } from 'react';

export const ConnectionStatus = () => {
  const { connectionStatus, isReconnecting, isDisconnected } = useRealtimeManager();
  const { t } = useLanguage();
  const [showReconnected, setShowReconnected] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Use ref to track disconnection state without triggering re-renders
  const wasDisconnectedRef = useRef(false);
  const timersRef = useRef<{ exit?: NodeJS.Timeout; hide?: NodeJS.Timeout }>({});

  // Track when we disconnect
  useEffect(() => {
    if (isDisconnected || isReconnecting) {
      wasDisconnectedRef.current = true;
      setIsExiting(false);
      setShowReconnected(false);
      
      // Clear any pending timers
      if (timersRef.current.exit) clearTimeout(timersRef.current.exit);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    }
  }, [isDisconnected, isReconnecting]);

  // Track when we reconnect
  useEffect(() => {
    if (connectionStatus === 'connected' && wasDisconnectedRef.current) {
      wasDisconnectedRef.current = false;
      setShowReconnected(true);
      setIsExiting(false);
      
      // Start exit animation after 700ms
      timersRef.current.exit = setTimeout(() => {
        setIsExiting(true);
      }, 700);
      
      // Hide after 1 second total
      timersRef.current.hide = setTimeout(() => {
        setShowReconnected(false);
        setIsExiting(false);
      }, 1000);
    }
  }, [connectionStatus]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (timersRef.current.exit) clearTimeout(timersRef.current.exit);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    };
  }, []);

  // Don't show anything if connected and not showing reconnected message
  if (connectionStatus === 'connected' && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className={`
        rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs shadow-lg
        ${isExiting ? 'animate-fade-out-fast' : 'animate-fade-in'}
        ${showReconnected ? 'bg-green-500/90 text-white' : ''}
        ${isReconnecting ? 'bg-yellow-500/90 text-black' : ''}
        ${isDisconnected ? 'bg-red-500/90 text-white' : ''}
      `}>
        {showReconnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>{t('connection.reconnected')}</span>
          </>
        ) : isReconnecting ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{t('connection.reconnecting')}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>{t('connection.disconnected')}</span>
          </>
        )}
      </div>
    </div>
  );
};
