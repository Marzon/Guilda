import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface PushNotificationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export const PushNotificationPrompt = ({
  open,
  onOpenChange,
  onComplete,
}: PushNotificationPromptProps) => {
  const { t } = useLanguage();
  const { subscribe, isLoading, isSupported } = usePushNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnable = async () => {
    setIsSubmitting(true);
    const success = await subscribe();
    setIsSubmitting(false);
    
    if (success) {
      // Mark as prompted so we don't ask again
      localStorage.setItem("push_prompt_completed", "true");
      onOpenChange(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    // Increment skip count, will ask again after 3 more logins
    const currentLogins = parseInt(localStorage.getItem("login_count") || "0", 10);
    localStorage.setItem("push_prompt_last_asked", currentLogins.toString());
    onOpenChange(false);
    onComplete?.();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {t("push.promptTitle", "Ativar Notificações?")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(
              "push.promptDescription",
              "Receba alertas instantâneos sobre novos matches, mensagens e convites para projetos. Você pode desativar a qualquer momento nas configurações."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t("push.benefitMessages", "Mensagens em tempo real")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("push.benefitMessagesDesc", "Saiba quando alguém te envia uma mensagem")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
              <span className="text-lg">🤝</span>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t("push.benefitMatches", "Novos matches")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("push.benefitMatchesDesc", "Seja notificado quando alguém aceitar sua conexão")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t("push.benefitProjects", "Convites para projetos")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("push.benefitProjectsDesc", "Receba convites para participar de startups")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleEnable}
            disabled={isLoading || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isLoading || isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("common.loading", "Carregando...")}
              </span>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                {t("push.enableButton", "Ativar Notificações")}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading || isSubmitting}
            className="w-full text-muted-foreground"
          >
            {t("push.skipButton", "Agora não")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
