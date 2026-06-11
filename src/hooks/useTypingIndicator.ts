import { useState, useEffect, useCallback, useRef } from 'react';
import { useRealtimeManager } from '@/hooks/useRealtimeManager';

interface TypingUser {
  user_id: string;
  username: string;
}

export const useTypingIndicator = (conversationId: string, currentUserId: string, currentUsername: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { subscribe, unsubscribe } = useRealtimeManager();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribe> | null>(null);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channelName = `typing:${conversationId}`;
    
    channelRef.current = subscribe(channelName, {
      presence: {
        key: currentUserId,
        data: {
          user_id: currentUserId,
          username: currentUsername,
        },
      },
      onPresenceSync: (state) => {
        const typing = Object.values(state)
          .flat()
          .filter((user: any) => user.user_id !== currentUserId && user.typing)
          .map((user: any) => ({
            user_id: user.user_id,
            username: user.username,
          }));
        setTypingUsers(typing);
      },
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [conversationId, currentUserId, currentUsername, subscribe, unsubscribe]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !currentUserId) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const channel = channelRef.current.channel;

      if (isTyping) {
        // Track typing state
        channel.track({
          user_id: currentUserId,
          username: currentUsername,
          typing: true,
        });

        // Auto-clear typing state after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          channel.track({
            user_id: currentUserId,
            username: currentUsername,
            typing: false,
          });
        }, 3000);
      } else {
        // Stop typing
        channel.track({
          user_id: currentUserId,
          username: currentUsername,
          typing: false,
        });
      }
    },
    [currentUserId, currentUsername]
  );

  return {
    typingUsers,
    setTyping,
    isOtherUserTyping: typingUsers.length > 0,
  };
};
