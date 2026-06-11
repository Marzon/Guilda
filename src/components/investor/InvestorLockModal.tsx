import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Rocket, Lock } from "lucide-react";
import type { LockReason } from "@/hooks/useCanContactInvestor";

interface InvestorLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: LockReason;
}

export const InvestorLockModal = ({
  open,
  onOpenChange,
  reason,
}: InvestorLockModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleFindCofounder = () => {
    onOpenChange(false);
    navigate("/"); // Redirect to Tavern to find co-founders, not Capital (investors)
  };

  const handleCreateProject = () => {
    onOpenChange(false);
    navigate("/create-project");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl">
            {t("investor.lockModal.title", "Forme seu Time Primeiro")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t(
              "investor.lockModal.description",
              "Investidores preferem conversar com founders que já formaram um time ou estão construindo algo juntos."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          <Button
            onClick={handleFindCofounder}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Users className="mr-2 h-5 w-5" />
            {t("investor.lockModal.findCofounder", "Encontrar Co-Founder")}
          </Button>

          <Button
            onClick={handleCreateProject}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Rocket className="mr-2 h-5 w-5" />
            {t("investor.lockModal.createProject", "Criar Projeto")}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t(
            "investor.lockModal.hint",
            "Com um co-founder ou projeto, você terá acesso direto aos investidores."
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
};
