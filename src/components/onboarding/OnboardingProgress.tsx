import { Check, Clock, MessageSquare, User, Palette, Code, Rocket, BookOpen, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { STEP_NAMES } from '@/hooks/useOnboardingTracking';

interface OnboardingProgressProps {
  currentStep: number;
  timeRemaining: number;
}

const STEP_ICONS = [
  MessageSquare, // signup_source
  User,          // archetype
  Palette,       // profile
  Code,          // skills
  Rocket,        // project
  BookOpen,      // tutorial
  PartyPopper,   // confirmation
];

export const OnboardingProgress = ({ currentStep, timeRemaining }: OnboardingProgressProps) => {
  const { t } = useTranslation();
  const totalSteps = STEP_NAMES.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-2 sm:space-y-4">
      {/* Mobile: Always show step count and time */}
      <div className="flex sm:hidden justify-between items-center text-xs text-muted-foreground mb-1">
        <span className="font-medium text-foreground">
          {currentStep + 1}/{totalSteps}
        </span>
        <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
          <Clock className="h-3 w-3" />
          {timeRemaining <= 1 
            ? t('onboarding.progress.lessThanMinute')
            : t('onboarding.progress.timeRemaining', { minutes: timeRemaining })
          }
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Desktop: Info line */}
      <div className="hidden sm:flex justify-between items-center text-sm text-muted-foreground">
        <span className="font-medium">
          {t('onboarding.progress.step', { current: currentStep + 1, total: totalSteps })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {timeRemaining <= 1 
            ? t('onboarding.progress.lessThanMinute')
            : t('onboarding.progress.timeRemaining', { minutes: timeRemaining })
          }
        </span>
      </div>
      
      {/* Step indicators - smaller on mobile */}
      <div className="flex justify-between gap-1">
        {STEP_ICONS.map((Icon, i) => (
          <div 
            key={i} 
            className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300",
              i < currentStep 
                ? "bg-accent text-accent-foreground scale-90" 
                : i === currentStep 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background" 
                  : "bg-muted text-muted-foreground scale-90 opacity-50"
            )}
          >
            {i < currentStep ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
