import { memo } from 'react';
import BadgeIcon from './BadgeIcon';
import type { Badge } from '@/hooks/useBadges';

interface BadgeShowcaseProps {
  badges: Badge[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BadgeShowcase = memo(({ 
  badges, 
  maxDisplay = 3, 
  size = 'sm',
  className 
}: BadgeShowcaseProps) => {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayBadges.map((badge) => (
        <BadgeIcon
          key={badge.id}
          icon={badge.icon}
          color={badge.color}
          name={badge.name}
          nameEn={badge.name_en}
          nameEs={badge.name_es}
          description={badge.description}
          descriptionEn={badge.description_en}
          descriptionEs={badge.description_es}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{remaining}
        </span>
      )}
    </div>
  );
});

BadgeShowcase.displayName = 'BadgeShowcase';

export default BadgeShowcase;
