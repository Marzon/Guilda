import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/useLanguage";

interface BasicBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const BasicBadge = ({ size = "sm", showTooltip = true }: BasicBadgeProps) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm",
  };

  const badge = (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-gradient-to-br from-purple-500 via-violet-400 to-purple-600 text-white font-bold rounded-full shadow-md`}
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
          className="bg-gradient-to-r from-purple-500 to-violet-600 text-white border-none shadow-lg"
        >
          <p className="font-medium flex items-center gap-1">
            ⚡ {t("badges.basicMember", "Membro Aceleração")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
