import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Crown } from "lucide-react";
import type { Archetype } from "@/types/archetype";

interface ProjectTeamMemberProps {
  username: string;
  avatarUrl: string | null;
  archetype: Archetype;
  roleName?: string;
  isOwner?: boolean;
  onConnect?: () => void;
  showConnectButton?: boolean;
  onClick?: () => void;
}

export const ProjectTeamMember = ({
  username,
  avatarUrl,
  archetype,
  roleName,
  isOwner = false,
  onConnect,
  showConnectButton = false,
  onClick,
}: ProjectTeamMemberProps) => {
  const archetypeColors: Record<Archetype, string> = {
    BUILDER: "border-cyber-purple",
    SELLER: "border-cyber-gold",
    INVESTOR: "border-emerald-500",
    STARTER: "border-purple-500",
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 glass rounded-lg border border-primary/20 ${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center gap-3">
        <Avatar className={`w-10 h-10 border-2 ${archetypeColors[archetype]}`}>
          <AvatarImage src={avatarUrl || ""} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{username}</p>
            {isOwner && (
              <Crown className="w-4 h-4 text-cyber-gold" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {roleName && (
              <span className="text-xs text-muted-foreground">{roleName}</span>
            )}
            <Badge
              variant="outline"
              className={`text-xs ${
                archetype === "BUILDER"
                  ? "border-cyber-purple text-cyber-purple"
                  : "border-cyber-gold text-cyber-gold"
              }`}
            >
              {archetype}
            </Badge>
          </div>
        </div>
      </div>

      {showConnectButton && onConnect && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onConnect();
          }}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Conectar
        </Button>
      )}
    </div>
  );
};
