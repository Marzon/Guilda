import { useState, useEffect } from "react";
import { FlaskConical, SkipForward, FastForward, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";

const STORAGE_KEY = "acceleration-test-mode-hidden";

interface TestModeBarProps {
  currentDay: number;
  totalDays: number;
  currentTaskId: string | null;
  onSkipTask: () => void;
  onGoToDay: (day: number) => void;
  isSkipping: boolean;
  isChangingDay: boolean;
  isAdmin: boolean;
}

export const TestModeBar = ({
  currentDay,
  totalDays,
  currentTaskId,
  onSkipTask,
  onGoToDay,
  isSkipping,
  isChangingDay,
  isAdmin,
}: TestModeBarProps) => {
  const { t } = useLanguage();
  const [targetDay, setTargetDay] = useState("");
  const [isHidden, setIsHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  // Persist preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isHidden.toString());
  }, [isHidden]);

  const handleGoToDay = () => {
    const day = parseInt(targetDay);
    if (day >= 1 && day <= totalDays) {
      onGoToDay(day);
      setTargetDay("");
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      onGoToDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDay < totalDays) {
      onGoToDay(currentDay + 1);
    }
  };

  // Collapsed/hidden state - show minimal bar
  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-100/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors text-sm"
      >
        <FlaskConical className="w-4 h-4" />
        <span>{t("acceleration.testMode.showTestMode", "Mostrar Modo de Teste")}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            {t("acceleration.testMode.title", "Modo de Teste Ativo")}
          </span>
          <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-300">
            {isAdmin ? "Admin" : "Manager"}
          </Badge>
        </div>
        
        {/* Hide button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsHidden(true)}
          className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
        >
          <EyeOff className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">{t("acceleration.testMode.hide", "Esconder")}</span>
          <ChevronUp className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Skip Task Button */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={onSkipTask}
          disabled={!currentTaskId || isSkipping}
          className="w-fit border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        >
          <SkipForward className="w-4 h-4 mr-1" />
          {isSkipping 
            ? t("acceleration.testMode.skipping", "Pulando...") 
            : t("acceleration.testMode.skipTask", "Pular Tarefa Atual")
          }
        </Button>

        {/* Day Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-amber-700 dark:text-amber-300 mr-1">
            {t("acceleration.testMode.dayNavigation", "Navegação:")}
          </span>
          
          {/* Previous Day Button */}
          <Button 
            size="sm"
            variant="outline"
            onClick={handlePreviousDay}
            disabled={currentDay <= 1 || isChangingDay}
            className="border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("acceleration.testMode.previousDay", "Anterior")}
          </Button>
          
          {/* Current Day Indicator */}
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 rounded-md font-medium text-amber-800 dark:text-amber-200 text-sm">
            {t("acceleration.testMode.dayIndicator", "Dia {{current}} de {{total}}", { current: currentDay, total: totalDays })}
          </span>
          
          {/* Next Day Button */}
          <Button 
            size="sm"
            variant="outline"
            onClick={handleNextDay}
            disabled={currentDay >= totalDays || isChangingDay}
            className="border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            {t("acceleration.testMode.nextDay", "Próximo")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {/* Go to Specific Day */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            {t("acceleration.testMode.goToDay", "Ir direto para dia:")}
          </span>
          <Input 
            type="number" 
            min={1} 
            max={totalDays}
            value={targetDay}
            onChange={(e) => setTargetDay(e.target.value)}
            placeholder={currentDay.toString()}
            className="w-16 h-8 text-center border-amber-300 dark:border-amber-600"
          />
          <Button 
            size="sm"
            variant="secondary"
            onClick={handleGoToDay}
            disabled={!targetDay || isChangingDay || parseInt(targetDay) < 1 || parseInt(targetDay) > totalDays}
            className="bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700"
          >
            <FastForward className="w-4 h-4 mr-1" />
            {isChangingDay 
              ? t("acceleration.testMode.going", "Indo...") 
              : t("acceleration.testMode.go", "Ir")
            }
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
        ⚠️ {t("acceleration.testMode.warning", "Use apenas para testes. Ações não são revertidas automaticamente.")}
      </p>
    </div>
  );
};
