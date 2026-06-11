import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserSkill } from "@/hooks/useSkills";

interface SkillBadgeProps {
  userSkill: UserSkill;
  showProficiency?: boolean;
  size?: "sm" | "md";
}

const categoryColors = {
  tech: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  design: "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
  business: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
};

const proficiencyLabels: Record<number, string> = {
  1: "Iniciante",
  2: "Básico",
  3: "Intermediário",
  4: "Avançado",
  5: "Expert",
};

export const SkillBadge = ({ userSkill, showProficiency = true, size = "md" }: SkillBadgeProps) => {
  const category = userSkill.skill?.category || 'tech';
  const proficiency = userSkill.proficiency_level;
  
  const stars = "★".repeat(proficiency) + "☆".repeat(5 - proficiency);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={cn(
              "transition-colors cursor-default",
              categoryColors[category],
              size === "sm" && "text-xs px-1.5 py-0"
            )}
          >
            {userSkill.skill?.name}
            {showProficiency && (
              <span className="ml-1 opacity-70">{proficiency}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{userSkill.skill?.name}</p>
            <p className="text-xs text-muted-foreground">
              {proficiencyLabels[proficiency]} ({stars})
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
