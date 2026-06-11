import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuildaAvatar } from "@/components/GuildaAvatar";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { DollarSign, ExternalLink, MessageCircle, Lock, Clock, Shield, Target } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";

interface Investment {
  id: string;
  startup_name: string;
  website_url: string;
}

interface InvestorProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  looking_for: string | null;
  offering: string | null;
  last_seen_at: string | null;
  investments?: Investment[];
  investor_type?: string | null;
  investor_sectors?: string[] | null;
  investor_check_range?: string | null;
}

interface InvestorCardProps {
  profile: InvestorProfile;
  isOnline?: boolean;
  canContact: boolean;
  onStartChat?: () => void;
  onShowLockModal?: () => void;
  onProfileClick?: (profile: {
    id: string;
    username: string;
    archetype: string;
    bio: string | null;
    avatar_url: string | null;
    tier?: string;
  }) => void;
  tier?: string;
}

export const InvestorCard = React.memo(({
  profile,
  isOnline = false,
  canContact,
  onStartChat,
  onShowLockModal,
  onProfileClick,
  tier = "FREE",
}: InvestorCardProps) => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const dateLocale = currentLanguage === "pt" ? ptBR : currentLanguage === "es" ? es : enUS;
  const lastSeenText = profile.last_seen_at
    ? formatDistanceToNow(new Date(profile.last_seen_at), {
        addSuffix: true,
        locale: dateLocale,
      })
    : null;

  const displayedInvestments = (profile.investments || []).slice(0, 3);
  const isVerified = (profile.investments?.length || 0) >= 3;

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick({
        id: profile.id,
        username: profile.username,
        archetype: "INVESTOR",
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        tier,
      });
    } else {
      navigate(`/u/${profile.username}`);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 border-2 border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-background to-emerald-50/30 dark:to-emerald-950/20">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative cursor-pointer" onClick={handleProfileClick}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-400/50"
            />
          ) : (
            <GuildaAvatar
              name={profile.username || "?"}
              archetype="INVESTOR"
              size="lg"
            />
          )}
          <OnlineIndicator isOnline={isOnline} className="absolute -bottom-0.5 -right-0.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold text-foreground truncate cursor-pointer hover:text-emerald-600 transition-colors"
              onClick={handleProfileClick}
            >
              {profile.username}
            </h3>
            
            {/* Investor Type Badge */}
            {profile.investor_type && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700 text-xs"
              >
                {t(`investor.type.${profile.investor_type}`, profile.investor_type)}
              </Badge>
            )}
            
            {/* Verified Badge */}
            {isVerified && (
              <Badge
                variant="outline"
                className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700 text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                {t("investor.card.verified", "Verificado")}
              </Badge>
            )}
            
            {tier !== "FREE" && (
              <Badge variant="secondary" className="text-xs">
                {tier}
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
      </div>

      {profile.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {profile.bio}
        </p>
      )}

      {/* Sectors of Interest */}
      {profile.investor_sectors && profile.investor_sectors.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 flex-wrap">
            <Target className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t("investor.card.lookingFor", "Busca")}:
            </span>
            {profile.investor_sectors.slice(0, 3).map((sector) => (
              <Badge
                key={sector}
                variant="outline"
                className="text-xs py-0 px-1.5"
              >
                {t(`investor.sector.${sector}`, sector)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {displayedInvestments.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {t("investor.capital.portfolio", "Portfólio")}:
          </p>
          <div className="flex flex-wrap gap-2">
            {displayedInvestments.map((inv) => (
              <a
                key={inv.id}
                href={inv.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
              >
                🔗 {inv.startup_name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {canContact ? (
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={onStartChat}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("investor.capital.sendMessage", "Enviar Mensagem")}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
            onClick={onShowLockModal}
          >
            <Lock className="w-4 h-4 mr-2" />
            {t("investor.capital.unlockWithTeam", "Desbloquear com um Time")}
          </Button>
        )}
      </div>
    </Card>
  );
});

InvestorCard.displayName = "InvestorCard";
