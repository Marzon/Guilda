import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swords, Flame, ArrowRight, Users, Calendar, X } from "lucide-react";
import { useCohorts } from "@/hooks/useCohorts";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/lib/routes";

export const AuthAccelerationDialog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openCohorts } = useCohorts();
  const [isOpen, setIsOpen] = useState(false);

  const activeCohort = openCohorts?.[0];
  const enrolledCount = activeCohort?.members_count || 0;
  const maxSlots = activeCohort?.max_slots || 30;
  const remainingSlots = maxSlots - enrolledCount;

  // Show dialog after a short delay when there's an active cohort
  useEffect(() => {
    if (!activeCohort) return;

    // Check if user already dismissed this session
    const dismissed = sessionStorage.getItem("auth_accel_dialog_dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeCohort]);

  const handleApply = () => {
    setIsOpen(false);
    navigate(ROUTES.accelerationApplication);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("auth_accel_dialog_dismissed", "true");
    setIsOpen(false);
  };

  if (!activeCohort) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-red-500/30 text-white p-0 gap-0">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-amber-500/10 rounded-lg" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>

          <div className="relative p-6 pt-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 rounded-full mb-4">
              <Swords className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t("auth.accelerationBadge", "Aceleração")}
              </span>
            </div>

            <DialogHeader className="text-left space-y-2 mb-4">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                {t("auth.accelerationTitle", "Protocolo DO OR DIE")}
              </DialogTitle>
              <p className="text-sm text-slate-300">
                {t(
                  "auth.accelerationDesc",
                  "De ideia a MVP validado em 15 dias. Encontre seu co-fundador e construa algo real."
                )}
              </p>
            </DialogHeader>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 pb-4 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(activeCohort.start_date).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {enrolledCount}/{maxSlots} inscritos
              </span>
              {remainingSlots <= 10 && (
                <span className="text-red-400 font-semibold">
                  {remainingSlots} {t("auth.slotsLeft", "vagas")}!
                </span>
              )}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleApply}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold group"
            >
              {t("auth.applyNow", "Aplicar")}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-xs text-slate-500 mt-3">
              Primeiro faça seu cadastro, depois aplique para a aceleração
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
