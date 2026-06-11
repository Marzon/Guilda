import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showStyledToast, ToastType } from "@/utils/styledToast";
import i18n from "@/i18n";


interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_user_id?: string;
  related_match_id?: string;
  action_url?: string;
}

interface PendingNotification {
  notifications: Notification[];
  senderName: string;
}

const DEBOUNCE_DELAY = 3000; // 3 seconds

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs for debounce and grouping
  const pendingNotificationsRef = useRef<Map<string, PendingNotification>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  // Show browser push notification
  const showPushNotification = (title: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading notifications:", error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter((n) => !n.read).length || 0);
    setLoading(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all as read:", error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Process pending notifications and show grouped toast
  const processPendingNotifications = useCallback(() => {
    const pending = pendingNotificationsRef.current;
    
    pending.forEach((data) => {
      const { notifications: notifs, senderName } = data;
      const count = notifs.length;
      
      if (count > 1) {
        // Grouped toast for multiple messages - use first notification's action_url
        showStyledToast({
          title: i18n.t('matches.newMessages', { count }),
          message: i18n.t('matches.fromSender', { sender: senderName }),
          type: 'new_message',
          actionUrl: notifs[0].action_url
        });
      } else if (count === 1) {
        // Single message toast
        showStyledToast({
          title: notifs[0].title,
          message: notifs[0].message,
          type: 'new_message',
          actionUrl: notifs[0].action_url
        });
      }
    });
    
    pending.clear();
  }, []);

  // Handle new notification with debounce for new_message types
  const handleNewNotification = useCallback((newNotification: Notification) => {
    // Update state immediately
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    const isOnMessagesPage = window.location.pathname.includes('/messages');
    
    // For new_message type: debounce and group
    if (newNotification.type === 'new_message') {
      const senderId = newNotification.related_user_id || 'unknown';
      const senderName = newNotification.title.replace('Nova mensagem de ', '').replace('New message from ', '').replace('Nuevo mensaje de ', '');
      
      // Add to pending map
      const existing = pendingNotificationsRef.current.get(senderId);
      if (existing) {
        existing.notifications.push(newNotification);
      } else {
        pendingNotificationsRef.current.set(senderId, {
          notifications: [newNotification],
          senderName,
        });
      }
      
      // Clear existing timer and set new one
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        processPendingNotifications();
      }, DEBOUNCE_DELAY);

      // Browser push only if not on messages page
      if (!isOnMessagesPage) {
        showPushNotification(newNotification.title, newNotification.message);
      }
    } else {
      // Other notification types: show immediately with styled toast
      showStyledToast({
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type as ToastType,
        actionUrl: newNotification.action_url
      });

      // Show browser push notification
      showPushNotification(newNotification.title, newNotification.message);
    }
  }, [processPendingNotifications]);

  useEffect(() => {
    if (!userId) return;

    loadNotifications();
    requestNotificationPermission();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          handleNewNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Clean up debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userId, handleNewNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
};
