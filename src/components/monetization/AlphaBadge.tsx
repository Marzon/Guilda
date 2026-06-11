import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/useLanguage";

interface AlphaBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const AlphaBadge = ({ size = "sm", showTooltip = true }: AlphaBadgeProps) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm",
  };

  const badge = (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-amber-900 font-bold rounded-full shadow-md animate-glow-gold`}
      style={{ minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }}
    >
      ⚡
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-none shadow-lg"
        >
          <p className="font-medium flex items-center gap-1">
            ⚡ {t("badges.alphaMember", "Membro Aceleração")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
