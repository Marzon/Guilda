import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuildaAvatar } from "@/components/GuildaAvatar";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { MessageCircle, Clock, Code, TrendingUp, FileText } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { SaveDealButton } from "@/components/dealflow/SaveDealButton";
import { QuickTagSelector } from "@/components/dealflow/QuickTagSelector";
import { DealTag } from "@/hooks/useDealFlow";

interface FounderProject {
  id: string;
  title: string;
  status: string;
  seeking_capital: boolean;
  capital_amount_sought: number | null;
}

interface FounderProfile {
  id: string;
  username: string;
  archetype: string;
  avatar_url: string | null;
  bio: string | null;
  looking_for: string | null;
  offering: string | null;
  last_seen_at: string | null;
  main_skills: string[] | null;
  tier?: string;
  projects?: FounderProject[];
}

interface FounderCardProps {
  profile: FounderProfile;
  isOnline?: boolean;
  onStartChat?: () => void;
  onProfileClick?: (profile: FounderProfile) => void;
  // Deal flow props
  isSaved?: boolean;
  dealTags?: DealTag[];
  onSaveDeal?: () => void;
  onOpenDeal?: () => void;
  onTagChange?: (tag: DealTag) => void; // Renamed from onTagToggle - single selection
  isSavingDeal?: boolean;
  // Tour props
  dataTourCard?: string;
  dataTourTags?: string;
  dataTourDetails?: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString("pt-BR")}`;
};

const getStageDisplay = (status: string) => {
  switch (status) {
    case "IDEA": return { emoji: "💡", label: "Ideia" };
    case "MVP": return { emoji: "🚀", label: "MVP" };
    case "SCALE": return { emoji: "📈", label: "Escala" };
    default: return { emoji: "📋", label: status };
  }
};

export const FounderCard = React.memo(({
  profile,
  isOnline = false,
  onStartChat,
  onProfileClick,
  isSaved = false,
  dealTags = [],
  onSaveDeal,
  onOpenDeal,
  onTagChange,
  isSavingDeal = false,
  dataTourCard,
  dataTourTags,
  dataTourDetails,
}: FounderCardProps) => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const dateLocale = currentLanguage === "pt" ? ptBR : currentLanguage === "es" ? es : enUS;
  const lastSeenText = profile.last_seen_at
    ? formatDistanceToNow(new Date(profile.last_seen_at), {
        addSuffix: true,
        locale: dateLocale,
      })
    : null;

  const isBuilder = profile.archetype === "BUILDER";
  const displayedSkills = (profile.main_skills || []).slice(0, 4);
  const displayedProjects = (profile.projects || []).slice(0, 2);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick(profile);
    } else {
      navigate(`/u/${profile.username}`);
    }
  };

  const handleSaveClick = () => {
    if (isSaved && onOpenDeal) {
      onOpenDeal();
    } else if (onSaveDeal) {
      onSaveDeal();
    }
  };

  return (
    <Card 
      className={`p-4 hover:shadow-lg transition-all duration-300 border-2 ${
        isBuilder 
          ? "border-violet-200/50 dark:border-violet-800/50 bg-gradient-to-br from-background to-violet-50/30 dark:to-violet-950/20"
          : "border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-background to-amber-50/30 dark:to-amber-950/20"
      }`}
      data-tour={dataTourCard}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative cursor-pointer" onClick={handleProfileClick}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className={`h-14 w-14 rounded-2xl object-cover ring-2 ${
                isBuilder ? "ring-violet-400/50" : "ring-amber-400/50"
              }`}
            />
          ) : (
            <GuildaAvatar
              name={profile.username || "?"}
              archetype={profile.archetype as "BUILDER" | "SELLER"}
              size="lg"
            />
          )}
          <OnlineIndicator isOnline={isOnline} className="absolute -bottom-0.5 -right-0.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-semibold text-foreground truncate cursor-pointer transition-colors ${
                isBuilder ? "hover:text-violet-600" : "hover:text-amber-600"
              }`}
              onClick={handleProfileClick}
            >
              {profile.username}
            </h3>
            
            {/* Archetype Badge */}
            <Badge
              variant="outline"
              className={`text-xs ${
                isBuilder
                  ? "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/50 dark:text-violet-400 dark:border-violet-700"
                  : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700"
              }`}
            >
              {isBuilder ? (
                <>
                  <Code className="w-3 h-3 mr-1" />
                  {t("archetype.BUILDER", "Builder")}
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {t("archetype.SELLER", "Seller")}
                </>
              )}
            </Badge>
            
            {profile.tier && profile.tier !== "FREE" && (
              <Badge variant="secondary" className="text-xs">
                {profile.tier}
              </Badge>
            )}
          </div>

          {!isOnline && lastSeenText && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {lastSeenText}
            </p>
          )}
        </div>

        {/* Save to Pipeline Button */}
        {onSaveDeal && (
          <SaveDealButton
            isSaved={isSaved}
            onSave={handleSaveClick}
            onOpen={onOpenDeal}
            isLoading={isSavingDeal}
            size="sm"
            dataTour={dataTourDetails}
          />
        )}
      </div>

      {/* Deal Tags - Interactive */}
      {isSaved && onTagChange && (
        <div className="mb-3" data-tour={dataTourTags}>
          <QuickTagSelector
            selectedTags={dealTags}
            onTagChange={onTagChange}
            size="sm"
          />
        </div>
      )}

      {/* Tour placeholder for tags when deal is not saved */}
      {!isSaved && dataTourTags && (
        <div data-tour={dataTourTags} className="hidden" />
      )}

      {profile.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {profile.bio}
        </p>
      )}

      {/* Skills */}
      {displayedSkills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {displayedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs py-0.5 px-2"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {displayedProjects.length > 0 && (
        <div className="mb-3 space-y-2">
          {displayedProjects.map((project) => {
            const stage = getStageDisplay(project.status);
            return (
              <div key={project.id} className="p-2 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium truncate max-w-[150px]">
                    {project.title}
                  </span>
                  <Badge variant="outline" className="text-xs py-0 px-1.5">
                    {stage.emoji} {stage.label}
                  </Badge>
                </div>
                
                {project.seeking_capital && project.capital_amount_sought && (
                  <div className="flex items-center gap-1">
                    <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700 py-0 px-1.5">
                      💰 {t("investor.capital.seeking", "Buscando")} {formatCurrency(project.capital_amount_sought)}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Looking For */}
      {profile.looking_for && (
        <div className="mb-4 p-2 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="font-medium">{t("profile.lookingFor", "Busca")}: </span>
            {profile.looking_for}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={`flex-1 ${
            isBuilder
              ? "bg-violet-600 hover:bg-violet-700"
              : "bg-amber-600 hover:bg-amber-700"
          }`}
          onClick={onStartChat}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("investor.capital.sendMessage", "Mensagem")}
        </Button>
        
        {/* Details button - only when deal is saved */}
        {isSaved && onOpenDeal && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenDeal}
            className="gap-1.5"
            data-tour={dataTourDetails}
          >
            <FileText className="w-4 h-4" />
            {t("dealFlow.actions.details", "Detalhes")}
          </Button>
        )}
      </div>
    </Card>
  );
});

FounderCard.displayName = "FounderCard";
