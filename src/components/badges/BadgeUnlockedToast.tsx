import { useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { styledToast } from '@/utils/styledToast';
import type { UserBadge } from '@/hooks/useBadges';

interface BadgeUnlockedToastProps {
  newBadges: UserBadge[];
  onNotified: (badgeIds: string[]) => void;
}

const BadgeUnlockedToast = ({ newBadges, onNotified }: BadgeUnlockedToastProps) => {
  const { t, currentLanguage } = useLanguage();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (newBadges.length === 0) return;

    // Filter out badges we've already notified about in this session
    const badgesToNotify = newBadges.filter(
      (ub) => !notifiedRef.current.has(ub.badge_id)
    );

    if (badgesToNotify.length === 0) return;

    const badgeIds = badgesToNotify.map(ub => ub.badge_id);

    // Mark as notified locally first to prevent re-triggering
    badgeIds.forEach(id => notifiedRef.current.add(id));

    badgesToNotify.forEach((userBadge) => {
      const badge = userBadge.badge;
      const displayName = currentLanguage === 'en' ? (badge.name_en || badge.name) :
                          currentLanguage === 'es' ? (badge.name_es || badge.name) : badge.name;

      styledToast.badge(
        t('badges.newBadge') || '🏆 Nova Conquista!',
        displayName,
        badge.color
      );
    });

    // Mark as notified in DB
    onNotified(badgeIds);
  }, [newBadges, currentLanguage, t]); // Removed onNotified from deps to prevent infinite loop

  return null;
};

export default BadgeUnlockedToast;
