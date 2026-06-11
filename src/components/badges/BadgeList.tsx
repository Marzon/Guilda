import { memo } from 'react';
import { Award, Lock } from 'lucide-react';
import BadgeIcon from './BadgeIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Badge, UserBadge } from '@/hooks/useBadges';
import { useLanguage } from '@/hooks/useLanguage';

interface BadgeListProps {
  allBadges: Badge[];
  userBadges: UserBadge[];
  userMetrics?: {
    matches: number;
    messages: number;
    projects: number;
    xp: number;
  };
}

const BadgeList = memo(({ allBadges, userBadges, userMetrics }: BadgeListProps) => {
  const { t, currentLanguage } = useLanguage();
  
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  const getMetricValue = (metric: string) => {
    if (!userMetrics) return 0;
    switch (metric) {
      case 'matches': return userMetrics.matches;
      case 'messages': return userMetrics.messages;
      case 'projects': return userMetrics.projects;
      case 'xp': return userMetrics.xp;
      default: return 0;
    }
  };

  const getProgress = (badge: Badge) => {
    const current = getMetricValue(badge.metric);
    return Math.min((current / badge.threshold) * 100, 100);
  };

  const getDisplayName = (badge: Badge) => {
    return currentLanguage === 'en' ? (badge.name_en || badge.name) : 
           currentLanguage === 'es' ? (badge.name_es || badge.name) : badge.name;
  };

  const getDisplayDescription = (badge: Badge) => {
    return currentLanguage === 'en' ? (badge.description_en || badge.description) : 
           currentLanguage === 'es' ? (badge.description_es || badge.description) : badge.description;
  };

  // Group badges by category
  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const categoryLabels: Record<string, string> = {
    social: t('badges.categorySocial') || 'Networking',
    engagement: t('badges.categoryEngagement') || 'Engajamento',
    achievement: t('badges.categoryAchievement') || 'Conquistas',
  };

  return (
    <div className="space-y-6">
      {Object.entries(badgesByCategory).map(([category, badges]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {categoryLabels[category] || category}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const progress = getProgress(badge);
              const currentValue = getMetricValue(badge.metric);

              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    isEarned 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-border/50 opacity-75'
                  }`}
                >
                  <div className="relative">
                    <BadgeIcon
                      icon={badge.icon}
                      color={isEarned ? badge.color : 'from-gray-400 to-gray-500'}
                      name={getDisplayName(badge)}
                      description={getDisplayDescription(badge)}
                      size="lg"
                      showTooltip={false}
                    />
                    {!isEarned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {getDisplayName(badge)}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {getDisplayDescription(badge)}
                    </p>
                    {!isEarned && userMetrics && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {currentValue}/{badge.threshold}
                        </p>
                      </div>
                    )}
                    {isEarned && (
                      <p className="text-[10px] text-primary mt-1">
                        ✓ {t('badges.unlocked') || 'Desbloqueado'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

BadgeList.displayName = 'BadgeList';

export default BadgeList;
