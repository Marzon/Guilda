import { useCallback, useMemo, useState } from 'react';
import { getShortVersion, APP_VERSION } from '@/lib/version';

/**
 * Stub hook — PWA was removed from this marketing site.
 * The installable PWA lives at suprema.guilda.app.br.
 */
export const useServiceWorker = () => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const currentVersion = useMemo(() => getShortVersion(), []);

  return {
    offlineReady: false,
    needRefresh: false,
    shouldShowPrompt: false,
    currentVersion,
    update: useCallback(() => { window.location.reload(); }, []),
    close: useCallback(() => {}, []),
    dismiss: useCallback(() => {}, []),
    showWhatsNew,
    previousVersion: null as string | null,
    dismissWhatsNew: useCallback(() => setShowWhatsNew(false), []),
    openWhatsNew: useCallback(() => setShowWhatsNew(true), []),
  };
};
