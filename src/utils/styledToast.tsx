import React from "react";
import { toast } from "sonner";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { 
  NotificationIcon, 
  NotificationType, 
  getNotificationConfig 
} from "@/components/ui/NotificationIcon";

export type ToastType = NotificationType;

interface ShowStyledToastOptions {
  title: string;
  message: string;
  type?: ToastType;
  actionUrl?: string;
  duration?: number;
  customIcon?: LucideIcon;
  customGradient?: string;
  onClick?: () => void;
}

/**
 * Shows a styled toast notification following the unified visual pattern:
 * - Circular icon with gradient background
 * - Bold title
 * - Muted description text
 * - Optional click action with chevron indicator
 */
export const showStyledToast = ({
  title,
  message,
  type = 'default',
  actionUrl,
  duration = 6000,
  customIcon,
  customGradient,
  onClick,
}: ShowStyledToastOptions) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
      toast.dismiss();
    } else if (actionUrl) {
      window.location.href = actionUrl;
      toast.dismiss();
    }
  };

  const isClickable = !!onClick || !!actionUrl;

  toast(
    <div 
      className={`flex items-center gap-4 py-1 w-full ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      <NotificationIcon 
        type={type} 
        size="lg" 
        customIcon={customIcon} 
        customGradient={customGradient} 
      />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
      </div>
      {isClickable && (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </div>,
    {
      duration,
      className: 'notification-toast',
    }
  );
};

// Convenience methods for common toast types
export const styledToast = {
  success: (title: string, message: string, options?: Partial<ShowStyledToastOptions>) => 
    showStyledToast({ title, message, type: 'success', ...options }),
  
  error: (title: string, message: string, options?: Partial<ShowStyledToastOptions>) => 
    showStyledToast({ title, message, type: 'error', ...options }),
  
  warning: (title: string, message: string, options?: Partial<ShowStyledToastOptions>) => 
    showStyledToast({ title, message, type: 'warning', ...options }),
  
  info: (title: string, message: string, options?: Partial<ShowStyledToastOptions>) => 
    showStyledToast({ title, message, type: 'info', ...options }),
  
  message: (title: string, message: string, actionUrl?: string) => 
    showStyledToast({ title, message, type: 'new_message', actionUrl }),
  
  match: (title: string, message: string, actionUrl?: string) => 
    showStyledToast({ title, message, type: 'new_match', actionUrl }),
  
  matchAccepted: (title: string, message: string, actionUrl?: string) => 
    showStyledToast({ title, message, type: 'match_accepted', actionUrl }),
  
  badge: (title: string, message: string, customGradient?: string) => 
    showStyledToast({ title, message, type: 'badge_unlocked', customGradient }),
};

export default showStyledToast;
