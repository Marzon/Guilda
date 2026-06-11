import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, TrendingUp, Wrench, Shield, PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CHANGELOG, ChangelogEntry, ChangelogChange } from '@/data/changelog';
import { APP_STAGE } from '@/lib/version';
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';

interface WhatsNewDialogProps {
  open: boolean;
  onClose: () => void;
  showAllVersions?: boolean;
  specificVersion?: string;
}

const typeIcons = {
  feature: Sparkles,
  improvement: TrendingUp,
  fix: Wrench,
  security: Shield,
};

const typeColors = {
  feature: 'text-primary',
  improvement: 'text-blue-500',
  fix: 'text-yellow-500',
  security: 'text-green-500',
};

const typeBgColors = {
  feature: 'bg-primary/10',
  improvement: 'bg-blue-500/10',
  fix: 'bg-yellow-500/10',
  security: 'bg-green-500/10',
};

const ChangeItem = ({ change }: { change: ChangelogChange }) => {
  const { t } = useTranslation();
  const Icon = typeIcons[change.type];
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`p-1.5 rounded-full ${typeBgColors[change.type]} shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${typeColors[change.type]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {t(change.titleKey)}
        </p>
        {change.descriptionKey && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(change.descriptionKey)}
          </p>
        )}
      </div>
    </div>
  );
};

const VersionSection = ({ entry, isLatest }: { entry: ChangelogEntry; isLatest?: boolean }) => {
  const { t, i18n } = useTranslation();
  
  const getLocale = () => {
    switch (i18n.language) {
      case 'pt': return ptBR;
      case 'es': return es;
      default: return enUS;
    }
  };
  
  const formattedDate = format(new Date(entry.date), 'd MMM yyyy', { locale: getLocale() });
  
  return (
    <div className={`${isLatest ? '' : 'border-t border-border pt-4 mt-4'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">v{entry.version}</span>
        {isLatest && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {APP_STAGE}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">· {formattedDate}</span>
      </div>
      
      <div className="space-y-1">
        {entry.changes.map((change, idx) => (
          <ChangeItem key={idx} change={change} />
        ))}
      </div>
    </div>
  );
};

export const WhatsNewDialog = ({ 
  open, 
  onClose, 
  showAllVersions = false,
  specificVersion 
}: WhatsNewDialogProps) => {
  const { t } = useTranslation();
  
  const entriesToShow = showAllVersions 
    ? CHANGELOG 
    : specificVersion 
      ? CHANGELOG.filter(e => e.version === specificVersion)
      : CHANGELOG.slice(0, 1);
  
  const latestVersion = CHANGELOG[0]?.version;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {showAllVersions 
              ? t('changelog.historyTitle', 'Histórico de versões')
              : t('changelog.whatsNew', 'Novidades')
            }
          </DialogTitle>
          <DialogDescription>
            {showAllVersions 
              ? t('changelog.historyDescription', 'Veja todas as atualizações do app')
              : t('changelog.newVersionDescription', 'Confira o que há de novo nesta versão')
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="py-2">
            {entriesToShow.map((entry, idx) => (
              <VersionSection 
                key={entry.version} 
                entry={entry} 
                isLatest={idx === 0 && entry.version === latestVersion}
              />
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {!showAllVersions && CHANGELOG.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // This could open a separate history view
                // For now, just close
              }}
              className="text-xs text-muted-foreground"
            >
              {t('changelog.viewHistory', 'Ver histórico')}
            </Button>
          )}
          <div className="flex-1" />
          <Button onClick={onClose} size="sm" className="gap-1.5">
            {t('changelog.understood', 'Entendi!')}
            <PartyPopper className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
