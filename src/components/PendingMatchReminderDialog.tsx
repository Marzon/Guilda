import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePendingCount } from "@/hooks/usePendingCount";
import { useDoNotDisturb } from "@/hooks/useDoNotDisturb";

const REMIND_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
const SESSION_KEY = "pending_match_remind_at";
const SHOWN_KEY = "pending_match_dialog_shown";

interface PendingMatchReminderDialogProps {
  userId: string | undefined;
}

export const PendingMatchReminderDialog = ({ userId }: PendingMatchReminderDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: pendingCount = 0 } = usePendingCount(userId ?? null);
  const { isDndActive } = useDoNotDisturb(userId);

  // Check if should show dialog on mount
  useEffect(() => {
    if (!userId || pendingCount === 0 || isDndActive) return;

    const remindAt = sessionStorage.getItem(SESSION_KEY);
    const alreadyShown = sessionStorage.getItem(SHOWN_KEY);

    // If there's a remind timer, don't show automatically
    if (remindAt) return;

    // Show on first load if not already shown this session
    if (!alreadyShown) {
      setOpen(true);
      sessionStorage.setItem(SHOWN_KEY, "true");
    }
  }, [userId, pendingCount, isDndActive]);

  // Check reminder timer periodically
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      const remindAt = sessionStorage.getItem(SESSION_KEY);
      if (remindAt && Date.now() >= Number(remindAt)) {
        sessionStorage.removeItem(SESSION_KEY);
        if (pendingCount > 0 && !isDndActive) {
          setOpen(true);
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userId, pendingCount, isDndActive]);

  const handleViewConnections = useCallback(() => {
    setOpen(false);
    sessionStorage.removeItem(SESSION_KEY);
    navigate("/tavern", { state: { openPendingDialog: true } });
  }, [navigate]);

  const handleRemindLater = useCallback(() => {
    const remindAt = Date.now() + REMIND_DELAY_MS;
    sessionStorage.setItem(SESSION_KEY, String(remindAt));
    setOpen(false);
  }, []);

  if (!userId || pendingCount === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{t("pendingReminder.title")}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {pendingCount === 1
              ? t("pendingReminder.messageSingle")
              : t("pendingReminder.message", { count: pendingCount })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleRemindLater}>
            {t("pendingReminder.remindLater")}
          </Button>
          <Button onClick={handleViewConnections}>
            {t("pendingReminder.viewConnections")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
