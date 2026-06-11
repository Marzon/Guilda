import { HelpCircle, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ToolHelpTooltipProps {
  toolId: string;
  variant?: 'header' | 'results' | 'inline';
}

export const ToolHelpTooltip = ({ toolId, variant = 'header' }: ToolHelpTooltipProps) => {
  const { t } = useTranslation();
  
  const instructions = t(`tools.${toolId}.instructions`, { returnObjects: true }) as {
    title: string;
    steps: string[];
    tip?: string;
  };

  // If no instructions found, don't render
  if (!instructions || typeof instructions === 'string' || !instructions.steps) {
    return null;
  }

  const sizeClasses = {
    header: 'w-8 h-8',
    results: 'w-7 h-7',
    inline: 'w-6 h-6'
  };

  const iconSizeClasses = {
    header: 'w-5 h-5',
    results: 'w-4 h-4',
    inline: 'w-4 h-4'
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={`inline-flex items-center justify-center ${sizeClasses[variant]} rounded-full bg-background/20 hover:bg-background/30 transition-colors border border-background/30`}
          aria-label={t('common.help', 'Ajuda')}
        >
          <HelpCircle className={`${iconSizeClasses[variant]} text-background/80`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">
            {instructions.title}
          </h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {instructions.tip && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                💡 {instructions.tip}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Component for displaying tips inline in results panel
interface ToolTipsBoxProps {
  toolId: string;
}

export const ToolTipsBox = ({ toolId }: ToolTipsBoxProps) => {
  const { t } = useTranslation();
  
  const instructions = t(`tools.${toolId}.instructions`, { returnObjects: true }) as {
    title: string;
    steps: string[];
    tip?: string;
  };

  if (!instructions || typeof instructions === 'string' || !instructions.tip) {
    return null;
  }

  return (
    <div className="my-8 p-5 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-xl relative z-10">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
            {t('common.tip', 'Dica')}
          </h4>
          <p className="text-sm text-amber-900 dark:text-amber-100/90 leading-relaxed">
            {instructions.tip}
          </p>
        </div>
      </div>
    </div>
  );
};