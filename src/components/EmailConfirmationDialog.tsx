import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailConfirmationDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
}

export const EmailConfirmationDialog = ({
  open,
  email,
  onClose,
}: EmailConfirmationDialogProps) => {
  const { t } = useTranslation();
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      setResent(true);
      toast.success(t("auth.emailResent", "Email reenviado com sucesso!"));
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error(t("auth.resendError", "Erro ao reenviar email"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {t("auth.confirmEmail", "Confirme seu email")}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {t(
              "auth.confirmEmailDescription",
              "Enviamos um link de confirmação para:"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-3 text-center">
            <span className="font-medium text-foreground">{email}</span>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              {t(
                "auth.checkInbox",
                "Verifique sua caixa de entrada e clique no link para ativar sua conta."
              )}
            </p>
            <p>
              {t(
                "auth.afterConfirmation",
                "Após confirmar, você poderá completar seu cadastro e acessar a plataforma."
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending || resent}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.resending", "Reenviando...")}
                </>
              ) : resent ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  {t("auth.emailResent", "Email reenviado!")}
                </>
              ) : (
                t("auth.resendEmail", "Reenviar email")
              )}
            </Button>

            <Button onClick={onClose} className="w-full">
              {t("common.understood", "Entendi")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
