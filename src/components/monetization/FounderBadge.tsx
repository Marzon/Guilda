import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const FounderBadge = () => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 animate-pulse">
          <Crown className="w-4 h-4 text-white" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">👑 Early Adopter</p>
        <p className="text-xs text-muted-foreground">Founder's Pass Member</p>
      </TooltipContent>
    </Tooltip>
  );
};