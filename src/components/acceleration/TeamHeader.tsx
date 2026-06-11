import { useState } from "react";
import { Pencil, Check, X, Users, Hammer, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AccelerationTeam } from "@/hooks/useAccelerationTeam";
import { useLanguage } from "@/hooks/useLanguage";

interface TeamHeaderProps {
  team: AccelerationTeam;
  onUpdateName: (name: string) => void;
  isUpdating?: boolean;
  currentUserId: string;
}

export const TeamHeader = ({ team, onUpdateName, isUpdating, currentUserId }: TeamHeaderProps) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.startup_name);

  const handleSave = () => {
    if (editName.trim() && editName !== team.startup_name) {
      onUpdateName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(team.startup_name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const isCurrentUser = (memberId: string | null) => memberId === currentUserId;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg p-4 mb-4">
      {/* Startup Name */}
      <div className="flex items-center gap-3 mb-3">
        <Users className="w-5 h-5 text-purple-500" />
        
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 max-w-xs"
              autoFocus
              placeholder={t("acceleration.team.startupName", "Nome da startup")}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-slate-800">{team.startup_name}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-slate-400 hover:text-purple-500"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="flex items-center gap-4">
        {/* Builder */}
        <TeamMemberBadge
          member={team.builder}
          role="BUILDER"
          icon={<Hammer className="w-3 h-3" />}
          colorClass="bg-blue-100 text-blue-700 border-blue-200"
          isCurrentUser={isCurrentUser(team.builder_id)}
          emptyLabel={t("acceleration.team.noBuilder", "Sem Builder")}
        />

        <span className="text-slate-300">+</span>

        {/* Seller */}
        <TeamMemberBadge
          member={team.seller}
          role="SELLER"
          icon={<DollarSign className="w-3 h-3" />}
          colorClass="bg-amber-100 text-amber-700 border-amber-200"
          isCurrentUser={isCurrentUser(team.seller_id)}
          emptyLabel={t("acceleration.team.noSeller", "Sem Seller")}
        />
      </div>
    </div>
  );
};

interface TeamMemberBadgeProps {
  member: { id: string; username: string; avatar_url: string | null } | null;
  role: 'BUILDER' | 'SELLER';
  icon: React.ReactNode;
  colorClass: string;
  isCurrentUser: boolean;
  emptyLabel: string;
}

const TeamMemberBadge = ({ member, role, icon, colorClass, isCurrentUser, emptyLabel }: TeamMemberBadgeProps) => {
  if (!member) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
          {icon}
        </div>
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-full border",
      isCurrentUser ? "ring-2 ring-purple-500 ring-offset-1" : "",
      colorClass
    )}>
      <Avatar className="w-5 h-5">
        <AvatarImage src={member.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {member.username?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium">@{member.username}</span>
      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
        {icon}
      </Badge>
    </div>
  );
};
