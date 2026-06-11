import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  lastSeenAt?: string | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const OnlineIndicator = ({ 
  isOnline, 
  lastSeenAt, 
  size = "sm", 
  showText = false,
  className 
}: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const getLastSeenText = () => {
    if (isOnline) return "Online agora";
    if (!lastSeenAt) return "Offline";

    const now = new Date();
    const lastSeen = new Date(lastSeenAt);
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

    if (diffMinutes < 1) return "Visto agora";
    if (diffMinutes < 60) return `Visto há ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Visto há ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Visto ontem";
    if (diffDays < 7) return `Visto há ${diffDays} dias`;
    
    return "Offline";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
        )}
      />
      {showText && (
        <span className={cn(
          "text-xs",
          isOnline ? "text-green-500" : "text-muted-foreground"
        )}>
          {getLastSeenText()}
        </span>
      )}
    </div>
  );
};
