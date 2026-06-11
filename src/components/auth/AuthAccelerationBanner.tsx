import { useNavigate } from "react-router-dom";
import { Swords, Flame, ArrowRight, Users, Calendar } from "lucide-react";
import { useCohorts } from "@/hooks/useCohorts";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/lib/routes";

export const AuthAccelerationBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openCohorts } = useCohorts();
  
  const activeCohort = openCohorts?.[0];
  const enrolledCount = activeCohort?.members_count || 0;
  const maxSlots = activeCohort?.max_slots || 30;
  const remainingSlots = maxSlots - enrolledCount;

  if (!activeCohort) return null;

  return (
    <div 
      onClick={() => navigate(ROUTES.accelerationApplication)}
      className="group relative mt-6 bg-gradient-to-br from-red-600/20 via-orange-500/20 to-amber-500/20 border border-red-500/30 rounded-xl p-5 cursor-pointer hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Badge */}
      <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 rounded-full">
        <Swords className="w-3.5 h-3.5 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          {t('auth.accelerationBadge', 'Aceleração')}
        </span>
      </div>

      <div className="relative pt-2">
        {/* Title */}
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-400" />
          {t('auth.accelerationTitle', 'Protocolo DO OR DIE')}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-300 mb-3">
          {t('auth.accelerationDesc', 'De ideia a MVP validado em 15 dias. Encontre seu co-fundador e construa algo real.')}
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(activeCohort.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {enrolledCount}/{maxSlots}
            </span>
          </div>
          
          {remainingSlots <= 10 ? (
            <span className="text-xs font-semibold text-red-400">
              {remainingSlots} {t('auth.slotsLeft', 'vagas')}!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
              {t('auth.applyNow', 'Aplicar')}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
