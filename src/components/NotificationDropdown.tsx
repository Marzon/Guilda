import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBadge } from "./NotificationBadge";
import { useNotifications } from "@/hooks/useNotifications";
import { useDoNotDisturb } from "@/hooks/useDoNotDisturb";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  userId: string | undefined;
}

export const NotificationDropdown = ({ userId }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { unreadCount } = useNotifications(userId);
  const { isDndActive, timeRemaining, activateDnd, deactivateDnd } = useDoNotDisturb(userId);

  const showPulse = isDndActive && unreadCount > 0;

  const handleActivateDnd = async (hours: 1 | 8 | 12) => {
    const success = await activateDnd(hours);
    if (success) {
      toast({
        title: t("notifications.dndActivated", { hours }),
      });
    }
  };

  const handleDeactivateDnd = async () => {
    const success = await deactivateDnd();
    if (success) {
      toast({
        title: t("notifications.dndDeactivated"),
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "glass relative",
            showPulse && "animate-pulse ring-2 ring-amber-400/50"
          )}
        >
          <Bell className={cn(
            "w-5 h-5",
            isDndActive && "text-amber-500"
          )} />
          <NotificationBadge count={unreadCount} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <DropdownMenuItem onClick={() => navigate("/notifications")}>
          <Bell className="mr-2 h-4 w-4" />
          {t("notifications.viewNotifications")}
          {unreadCount > 0 && (
            <span className="ml-auto text-xs font-medium text-primary">{unreadCount}</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
          <BellOff className="h-3.5 w-3.5" />
          {t("notifications.dndLabel")}
        </DropdownMenuLabel>
        
        {isDndActive ? (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {t("notifications.dndActiveFor", { time: timeRemaining })}
            </div>
            <DropdownMenuItem onClick={handleDeactivateDnd}>
              {t("notifications.dndDeactivate")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => handleActivateDnd(1)}>
              <Clock className="mr-2 h-4 w-4" />
              {t("notifications.dnd1h")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleActivateDnd(8)}>
              <Clock className="mr-2 h-4 w-4" />
              {t("notifications.dnd8h")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleActivateDnd(12)}>
              <Clock className="mr-2 h-4 w-4" />
              {t("notifications.dnd12h")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
