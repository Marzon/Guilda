import { memo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Crown,
  MessageCircle,
  MessagesSquare,
  Megaphone,
  Rocket,
  Building2,
  Star,
  Flame,
  Trophy,
  Award,
  Smartphone,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/hooks/useLanguage';

const iconMap: Record<string, LucideIcon> = {
  Users,
  UserCheck,
  UserPlus,
  Crown,
  MessageCircle,
  MessagesSquare,
  Megaphone,
  Rocket,
  Building2,
  Star,
  Flame,
  Trophy,
  Award,
  Smartphone,
};

interface BadgeIconProps {
  icon: string;
  color: string;
  name: string;
  nameEn?: string | null;
  nameEs?: string | null;
  description: string;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const BadgeIcon = memo(({
  icon,
  color,
  name,
  nameEn,
  nameEs,
  description,
  descriptionEn,
  descriptionEs,
  size = 'md',
  showTooltip = true,
  className,
}: BadgeIconProps) => {
  const { currentLanguage } = useLanguage();
  
  const IconComponent = iconMap[icon] || Award;
  
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const displayName = currentLanguage === 'en' ? (nameEn || name) : 
                      currentLanguage === 'es' ? (nameEs || name) : name;
  
  const displayDescription = currentLanguage === 'en' ? (descriptionEn || description) :
                             currentLanguage === 'es' ? (descriptionEs || description) : description;

  const badge = (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center shadow-md',
        color,
        sizeClasses[size],
        className
      )}
    >
      <IconComponent 
        size={iconSizes[size]} 
        className="text-white drop-shadow-sm" 
      />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayDescription}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

BadgeIcon.displayName = 'BadgeIcon';

export default BadgeIcon;
