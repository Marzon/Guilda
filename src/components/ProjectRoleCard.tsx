import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Zap, Clock, Check, X } from "lucide-react";
import type { Archetype } from "@/types/archetype";

interface ProjectRoleCardProps {
  roleName: string;
  roleDescription: string | null;
  requiredArchetype: Archetype | null;
  requiredSkills: string[];
  isFilled: boolean;
  onApply?: () => void;
  showApplyButton?: boolean;
  applicationStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | null;
}

export const ProjectRoleCard = ({
  roleName,
  roleDescription,
  requiredArchetype,
  requiredSkills,
  isFilled,
  onApply,
  showApplyButton = false,
  applicationStatus,
}: ProjectRoleCardProps) => {
  const archetypeColors: Record<Archetype, string> = {
    BUILDER: "bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30",
    SELLER: "bg-cyber-gold/20 text-cyber-gold border-cyber-gold/30",
    INVESTOR: "bg-emerald-100 text-emerald-700 border-emerald-300",
    STARTER: "bg-purple-100 text-purple-700 border-purple-300",
  };

  return (
    <Card className="glass p-4 border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">{roleName}</h4>
        </div>
        {isFilled ? (
          <Badge variant="secondary" className="text-xs">
            Preenchida
          </Badge>
        ) : (
          <Badge className="text-xs bg-cyber-green/20 text-cyber-green border-cyber-green/30">
            <Zap className="w-3 h-3 mr-1" />
            Aberta
          </Badge>
        )}
      </div>

      {roleDescription && (
        <p className="text-sm text-muted-foreground mb-3">{roleDescription}</p>
      )}

      <div className="space-y-2">
        {requiredArchetype && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Classe:</span>
            <Badge className={archetypeColors[requiredArchetype]}>
              {requiredArchetype}
            </Badge>
          </div>
        )}

        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-1">Skills:</span>
            {requiredSkills.map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {applicationStatus && (
        <div className="mt-4">
          <Badge 
            variant="outline"
            className={
              applicationStatus === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
              applicationStatus === "ACCEPTED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
              applicationStatus === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
              "bg-muted text-muted-foreground"
            }
          >
            {applicationStatus === "PENDING" && <><Clock className="w-3 h-3 mr-1" /> Candidatura Enviada</>}
            {applicationStatus === "ACCEPTED" && <><Check className="w-3 h-3 mr-1" /> Aceita</>}
            {applicationStatus === "REJECTED" && <><X className="w-3 h-3 mr-1" /> Rejeitada</>}
            {applicationStatus === "WITHDRAWN" && "Cancelada"}
          </Badge>
        </div>
      )}

      {showApplyButton && !isFilled && onApply && !applicationStatus && (
        <Button
          onClick={onApply}
          className="w-full mt-4"
          size="sm"
        >
          Candidatar-se
        </Button>
      )}
    </Card>
  );
};
