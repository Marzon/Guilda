import React from "react";
import {
  MessageCircle,
  Heart,
  Users,
  Bell,
  Trophy,
  Award,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  Gift,
  UserPlus,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type NotificationType =
  | "new_message"
  | "new_match"
  | "match_request"
  | "match_accepted"
  | "match_auto_accepted"
  | "founder_introduction"
  | "success_story"
  | "badge_unlocked"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "project_invite"
  | "role_application"
  | "gift"
  | "welcome"
  | "default";

interface IconConfig {
  icon: LucideIcon;
  gradient: string;
}

export const NOTIFICATION_ICON_CONFIG: Record<NotificationType, IconConfig> = {
  new_message: {
    icon: MessageCircle,
    gradient: "from-blue-500 to-purple-600",
  },
  new_match: {
    icon: Heart,
    gradient: "from-pink-500 to-rose-600",
  },
  match_request: {
    icon: Heart,
    gradient: "from-pink-500 to-rose-600",
  },
  match_accepted: {
    icon: Heart,
    gradient: "from-green-500 to-emerald-600",
  },
  match_auto_accepted: {
    icon: Heart,
    gradient: "from-green-500 to-emerald-600",
  },
  founder_introduction: {
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
  },
  success_story: {
    icon: Trophy,
    gradient: "from-amber-500 to-yellow-600",
  },
  badge_unlocked: {
    icon: Award,
    gradient: "from-purple-500 to-pink-600",
  },
  success: {
    icon: CheckCircle,
    gradient: "from-green-500 to-emerald-600",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-500 to-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-600",
  },
  info: {
    icon: Info,
    gradient: "from-blue-500 to-cyan-600",
  },
  project_invite: {
    icon: Briefcase,
    gradient: "from-indigo-500 to-purple-600",
  },
  role_application: {
    icon: UserPlus,
    gradient: "from-cyan-500 to-blue-600",
  },
  gift: {
    icon: Gift,
    gradient: "from-pink-500 to-purple-600",
  },
  welcome: {
    icon: Sparkles,
    gradient: "from-amber-500 to-yellow-500",
  },
  default: {
    icon: Bell,
    gradient: "from-primary to-primary/80",
  },
};

export type NotificationIconSize = "sm" | "md" | "lg";

interface NotificationIconProps {
  type: NotificationType | string;
  size?: NotificationIconSize;
  customIcon?: LucideIcon;
  customGradient?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NotificationIconSize, { container: string; icon: string }> = {
  sm: { container: "w-8 h-8", icon: "h-4 w-4" },
  md: { container: "w-10 h-10", icon: "h-5 w-5" },
  lg: { container: "w-12 h-12", icon: "h-6 w-6" },
};

export const NotificationIcon = ({
  type,
  size = "md",
  customIcon,
  customGradient,
  className = "",
}: NotificationIconProps) => {
  const config = NOTIFICATION_ICON_CONFIG[type as NotificationType] || NOTIFICATION_ICON_CONFIG.default;
  const sizeConfig = SIZE_CLASSES[size];

  const IconComponent = customIcon || config.icon;
  const gradient = customGradient || config.gradient;

  return (
    <div
      className={`${sizeConfig.container} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0 ${className}`}
    >
      <IconComponent className={`${sizeConfig.icon} text-white`} />
    </div>
  );
};

export const getNotificationConfig = (type: NotificationType | string) => {
  return NOTIFICATION_ICON_CONFIG[type as NotificationType] || NOTIFICATION_ICON_CONFIG.default;
};
