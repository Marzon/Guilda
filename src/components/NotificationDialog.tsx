import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Check, MessageCircle, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/hooks/useLanguage";
import { useDoNotDisturb } from "@/hooks/useDoNotDisturb";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { LinkifyText } from "./LinkifyText";
import { NotificationQuickReply } from "./notifications/NotificationQuickReply";
import { NotificationDetailDialog } from "./notifications/NotificationDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { NotificationIcon, NotificationType } from "@/components/ui/NotificationIcon";

const GUILDA_DOMAINS = ['guilda.app.br', 'guilda.lovable.app', 'localhost'];
const SESSION_KEY = 'notifications_dialog_suspended';
const SKIP_KEY = 'notifications_dialog_skipped_at';

const isInternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return GUILDA_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

const getPathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return "/";
  }
};

const getLocale = (lang: string) => {
  switch (lang) {
    case "pt": return ptBR;
    case "es": return es;
    default: return enUS;
  }
};

const getNotificationIcon = (type: string) => {
  return <NotificationIcon type={type as NotificationType} size="md" />;
};

interface NotificationDialogProps {
  userId: string | undefined;
}

export const NotificationDialog = ({ userId }: NotificationDialogProps) => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, markAsRead } = useNotifications(userId);
  const { isDndActive } = useDoNotDisturb(userId);
  const [open, setOpen] = useState(false);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const [messagePreviews, setMessagePreviews] = useState<Record<string, string>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeGroupChatId, setActiveGroupChatId] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; notification: any | null }>({
    open: false,
    notification: null,
  });
  const [skippedAt, setSkippedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SKIP_KEY);
    } catch {
      return null;
    }
  });

  const isOnMessagesPage = location.pathname === "/messages";

  // Reset suspended state when route changes
  useEffect(() => {
    setIsSuspended(false);
    sessionStorage.removeItem(SESSION_KEY);
  }, [location.pathname]);

  // Track active conversation from sessionStorage (set by Messages page)
  useEffect(() => {
    const checkActiveChat = () => {
      if (isOnMessagesPage) {
        setActiveChatUserId(sessionStorage.getItem('active_chat_user_id'));
        setActiveGroupChatId(sessionStorage.getItem('active_group_chat_id'));
      } else {
        setActiveChatUserId(null);
        setActiveGroupChatId(null);
      }
    };
    
    checkActiveChat();
    
    // Check periodically for changes (same tab)
    const interval = setInterval(checkActiveChat, 500);
    
    return () => clearInterval(interval);
  }, [isOnMessagesPage]);

  // Get unread notifications that haven't been processed in this session
  // Only suppress notifications from the ACTIVELY VISIBLE conversation
  const unreadNotifications = notifications.filter(n => {
    if (n.read || processedIds.has(n.id)) return false;
    
    // Only suppress if user has this specific conversation open AND focused
    if (isOnMessagesPage && n.type === "new_message") {
      // Only suppress if the chat with this user is actively visible
      if (activeChatUserId && n.related_user_id === activeChatUserId) {
        return false;
      }
    }
    
    // Only suppress group notifications if that specific group is open
    if (isOnMessagesPage && n.type === "founder_introduction") {
      const groupMatch = n.action_url?.match(/group=([a-f0-9-]+)/i);
      if (activeGroupChatId && groupMatch && groupMatch[1] === activeGroupChatId) {
        return false;
      }
    }
    
    return true;
  });

  // Fetch message previews for match_accepted notifications
  useEffect(() => {
    const fetchMessagePreviews = async () => {
      if (!userId) return;
      
      const matchNotifications = unreadNotifications.filter(
        n => ["match_accepted", "match_auto_accepted"].includes(n.type) && n.related_user_id
      );
      
      if (matchNotifications.length === 0) return;
      
      const previews: Record<string, string> = {};
      
      for (const notif of matchNotifications) {
        try {
          const { data: conversationId } = await supabase.rpc(
            "get_or_create_conversation",
            { other_user_id: notif.related_user_id }
          );
          
          if (conversationId) {
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("content, sender_id, sender:profiles(username)")
              .eq("conversation_id", conversationId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (lastMessage) {
              const isOwnMessage = lastMessage.sender_id === userId;
              const preview = lastMessage.content?.substring(0, 40) || "";
              const sender = lastMessage.sender as { username?: string } | null;
              previews[notif.id] = isOwnMessage 
                ? `${t("common.you", "Você")}: ${preview}${lastMessage.content?.length > 40 ? "..." : ""}`
                : `${sender?.username || "..."}: ${preview}${lastMessage.content?.length > 40 ? "..." : ""}`;
            }
          }
        } catch (error) {
          console.error("Error fetching preview:", error);
        }
      }
      
      if (Object.keys(previews).length > 0) {
        setMessagePreviews(prev => ({ ...prev, ...previews }));
      }
    };
    
    fetchMessagePreviews();
  }, [unreadNotifications.length, userId, t]);

  // Check if there are notifications created after the skip timestamp
  const hasNewNotificationsSinceSkip = skippedAt
    ? unreadNotifications.some(n => new Date(n.created_at) > new Date(skippedAt))
    : true;

  // Open dialog when there are unread notifications (unless suspended or DND active)
  // If user skipped before, only open if there are NEW notifications since the skip
  useEffect(() => {
    if (unreadNotifications.length > 0 && !open && !isSuspended && !isDndActive && hasNewNotificationsSinceSkip) {
      setOpen(true);
    }
  }, [unreadNotifications, open, isSuspended, isDndActive, hasNewNotificationsSinceSkip]);

  const handleSuspend = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // sessionStorage not available
    }
    setIsSuspended(true);
    setOpen(false);
  }, []);

  const handleSkip = useCallback(() => {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(SKIP_KEY, now);
    } catch {
      // localStorage not available
    }
    setSkippedAt(now);
    setOpen(false);
  }, []);

  const handleNotificationClick = useCallback(async (notification: any) => {
    // Mark as read
    await markAsRead(notification.id);
    
    // Add to processed set
    setProcessedIds(prev => new Set([...prev, notification.id]));

    // For new_message type, go directly to messages
    if (notification.type === "new_message") {
      const remainingUnread = unreadNotifications.filter(n => n.id !== notification.id);
      if (remainingUnread.length === 0) {
        setOpen(false);
      }
      
      setTimeout(() => {
        if (notification.related_user_id) {
          navigate("/messages", { state: { openChatWithUserId: notification.related_user_id } });
        } else {
          navigate("/messages");
        }
      }, 100);
      return;
    }

    // For match_accepted, go to messages with chat
    if (["match_accepted", "match_auto_accepted"].includes(notification.type)) {
      const remainingUnread = unreadNotifications.filter(n => n.id !== notification.id);
      if (remainingUnread.length === 0) {
        setOpen(false);
      }
      
      setTimeout(() => {
        if (notification.related_user_id) {
          navigate("/messages", { state: { openChatWithUserId: notification.related_user_id } });
        } else {
          navigate("/messages");
        }
      }, 100);
      return;
    }

    // For match_request, go to profile
    if (["match_request", "match_expiring_warning"].includes(notification.type)) {
      const remainingUnread = unreadNotifications.filter(n => n.id !== notification.id);
      if (remainingUnread.length === 0) {
        setOpen(false);
      }
      
      setTimeout(() => {
        if (notification.related_user_id) {
          navigate(`/u/${notification.related_user_id}`);
        } else {
          navigate("/tavern");
        }
      }, 100);
      return;
    }

    // For all other notifications, open the detail dialog
    setDetailDialog({ open: true, notification });
  }, [markAsRead, navigate, unreadNotifications]);

  // Don't render if no unread notifications, suspended, DND active, or skipped with no new notifications
  if (!userId || unreadNotifications.length === 0 || isSuspended || isDndActive || !hasNewNotificationsSinceSkip) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md max-h-[85vh] p-0 gap-0 border-2 border-primary/30 shadow-2xl"
        hideCloseButton
      >
        <DialogHeader className="p-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold">
                {t("notifications.title", "Notificações")}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {unreadNotifications.length === 1 
                  ? t("notifications.oneUnread", "1 nova notificação")
                  : t("notifications.multipleUnread", "{{count}} novas notificações").replace("{{count}}", String(unreadNotifications.length))
                }
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="divide-y divide-border/50">
            {unreadNotifications.map((notification) => {
              const isMatchAccepted = ["match_accepted", "match_auto_accepted"].includes(notification.type);
              const preview = messagePreviews[notification.id];
              
              // Extract username from notification title (e.g., "username aceitou")
              const usernameMatch = notification.title?.match(/^(.+?)\s+(aceitou|accepted|aceptó)/i);
              const recipientUsername = usernameMatch?.[1] || notification.title?.split(" ")[0] || "";
              
              return (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full text-left flex gap-4 items-start group"
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        <LinkifyText text={notification.message} />
                      </p>
                      
                      {/* Message preview for accepted matches */}
                      {isMatchAccepted && preview && (
                        <p className="text-xs text-muted-foreground/80 mt-1.5 italic truncate">
                          💬 {preview}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground/70 mt-1.5">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: getLocale(currentLanguage),
                        })}
                      </p>
                      
                      {/* Visible mark as read button */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Check className="w-3.5 h-3.5" />
                        {t("notifications.markAsRead", "Marcar como lida")}
                      </div>
                    </div>
                  </button>
                  
                  {/* Quick reply for match_accepted notifications */}
                  {isMatchAccepted && notification.related_user_id && userId && (
                    <div className="mt-3 ml-9 flex gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotificationClick(notification)}
                        className="text-xs h-8 gap-1.5"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {t("notifications.viewConversation", "Ver conversa")}
                      </Button>
                      
                      <NotificationQuickReply
                        recipientId={notification.related_user_id}
                        recipientUsername={recipientUsername}
                        currentUserId={userId}
                        onMessageSent={() => {
                          markAsRead(notification.id);
                          setProcessedIds(prev => new Set([...prev, notification.id]));
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-muted/30 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleSuspend}
              className="flex-1 h-11 gap-2 text-sm font-medium"
            >
              <EyeOff className="h-4 w-4" />
              {t("notifications.hideButton", "Ver depois")}
            </Button>
            <Button
              variant="default"
              onClick={handleSkip}
              className="flex-1 h-11 gap-2 text-sm font-medium"
            >
              <Check className="h-4 w-4" />
              {t("notifications.gotItButton", "Entendi")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {t("notifications.clickToMarkRead", "Clique em cada notificação para marcar como lida")}
          </p>
        </div>
      </DialogContent>

      {/* Notification Detail Dialog */}
      <NotificationDetailDialog
        notification={detailDialog.notification}
        open={detailDialog.open}
        onOpenChange={(open) => {
          setDetailDialog({ open, notification: open ? detailDialog.notification : null });
          // Check if we should close main dialog
          if (!open) {
            const remainingUnread = unreadNotifications.filter(n => n.id !== detailDialog.notification?.id);
            if (remainingUnread.length === 0) {
              setOpen(false);
            }
          }
        }}
        onNavigate={() => setOpen(false)}
      />
    </Dialog>
  );
};