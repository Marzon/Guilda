import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, X, Wifi, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WhatsNewDialog } from './WhatsNewDialog';
import { useAuth } from '@/hooks/useAuth';

export const ReloadPrompt = () => {
  const { t } = useTranslation();
  const { data: auth, isLoading: isAuthLoading } = useAuth();
  const isLoggedIn = !isAuthLoading && !!auth?.user;
  
  const { 
    shouldShowPrompt, 
    offlineReady, 
    update, 
    close, 
    dismiss,
    currentVersion,
    showWhatsNew,
    dismissWhatsNew
  } = useServiceWorker();
  
  // Only show update prompt and offline ready for logged-in users
  const showUpdatePrompt = shouldShowPrompt && isLoggedIn;
  const showOfflineReady = offlineReady && isLoggedIn;

  return (
    <>
      {/* Update/Offline Toast */}
      {(showUpdatePrompt || showOfflineReady) && (
        <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 md:bottom-4">
          <Card className="p-4 shadow-lg max-w-sm border-border bg-card">
            {showUpdatePrompt ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">
                        {t('pwa.newVersion', 'Nova versão disponível!')}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('pwa.updatePromptInfo', 'Atualize para receber melhorias e novos recursos')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-1"
                    onClick={dismiss}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-end">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={dismiss}
                      className="text-muted-foreground"
                    >
                      {t('common.dismiss', 'Ignorar')}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={update}
                    >
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      {t('pwa.updateNow', 'Atualizar')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : showOfflineReady ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {t('pwa.offlineReady', 'App pronto para uso offline')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentVersion}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={close}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      )}

      {/* What's New Dialog */}
      <WhatsNewDialog 
        open={showWhatsNew} 
        onClose={dismissWhatsNew}
      />
    </>
  );
};
