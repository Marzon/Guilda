import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeManager } from "@/hooks/useRealtimeManager";

// Debounce delay for cache invalidations
const INVALIDATION_DEBOUNCE_MS = 100;

export const useUnifiedRealtimeChannel = (userId: string | null) => {
  // ✅ Todos os hooks devem ser chamados na mesma ordem em cada render
  // 1. Primeiro os useRef (não causam re-render)
  const pendingInvalidations = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 2. Depois outros hooks
  const queryClient = useQueryClient();
  const { subscribe, unsubscribe, connectionStatus } = useRealtimeManager();

  // 3. useCallback por último antes dos useEffects
  const debouncedInvalidate = useCallback((queryKeys: string[]) => {
    queryKeys.forEach(key => pendingInvalidations.current.add(key));
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      pendingInvalidations.current.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      pendingInvalidations.current.clear();
    }, INVALIDATION_DEBOUNCE_MS);
  }, [queryClient]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const managed = subscribe('app-unified', {
      postgresChanges: [
        { event: '*', table: 'matches' },
        { event: 'INSERT', table: 'messages' },
        { event: '*', table: 'conversations' },
        { event: '*', table: 'subscriptions', filter: `user_id=eq.${userId}` },
        { event: '*', table: 'notifications', filter: `user_id=eq.${userId}` },
        { event: '*', table: 'group_conversations' },
        { event: '*', table: 'group_conversation_members', filter: `user_id=eq.${userId}` },
        { event: '*', table: 'founder_introductions' },
      ],
      onPostgresChange: (table, payload) => {
        switch (table) {
          case 'matches':
            debouncedInvalidate(['matches', 'pending-count']);
            break;
          case 'messages':
            // ✅ CORRIGIDO: Apenas atualizar contadores - NÃO invalidar conversations
            // Isso evita flickering causado por refetch completo
            debouncedInvalidate(['unread-count']);
            // A lista de conversas será atualizada via setQueryData quando necessário
            break;
          case 'conversations':
            debouncedInvalidate(['conversations']);
            break;
          case 'subscriptions':
            debouncedInvalidate(['auth-session', 'subscription']);
            break;
          case 'notifications':
            debouncedInvalidate(['notifications']);
            break;
          case 'group_conversations':
            debouncedInvalidate(['group-conversations']);
            break;
          case 'group_conversation_members':
            debouncedInvalidate(['group-conversations']);
            break;
          case 'founder_introductions':
            debouncedInvalidate(['founder-introductions']);
            break;
        }
      },
      onReconnect: () => {
        // On reconnect, invalidate all important queries
        debouncedInvalidate([
          'matches',
          'pending-count',
          'unread-count',
          'conversations',
          'notifications',
          'group-conversations',
          'founder-introductions'
        ]);
      },
    });

    return () => {
      unsubscribe('app-unified');
    };
  }, [userId, queryClient, subscribe, unsubscribe, debouncedInvalidate]);

  return { connectionStatus };
};

// Keep backward compatibility
export const useRealtimeChannel = useUnifiedRealtimeChannel;
