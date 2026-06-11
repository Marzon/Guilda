/**
 * Utility to clear Service Worker caches and unregister SWs
 * Use this for debugging or when users report stale content issues
 */

/**
 * Clear all caches managed by the browser
 */
export async function clearAllCaches(): Promise<boolean> {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('[Cache Clear] Found caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(async (name) => {
          await caches.delete(name);
          console.log(`[Cache Clear] Deleted cache: ${name}`);
        })
      );
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Cache Clear] Error clearing caches:', error);
    return false;
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<boolean> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('[SW Clear] Found service workers:', registrations.length);
      
      await Promise.all(
        registrations.map(async (registration) => {
          const result = await registration.unregister();
          console.log(`[SW Clear] Unregistered SW:`, result);
        })
      );
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('[SW Clear] Error unregistering service workers:', error);
    return false;
  }
}

/**
 * Full cache and SW reset - clears everything and reloads
 */
export async function fullCacheReset(): Promise<void> {
  console.log('[Cache Reset] Starting full cache reset...');
  
  // Backup auth state (Supabase session keys)
  const authBackup: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
      authBackup[key] = localStorage.getItem(key) || '';
    }
  }
  console.log('[Cache Reset] Auth state backed up:', Object.keys(authBackup).length, 'keys');
  
  const cachesCleared = await clearAllCaches();
  const swsUnregistered = await unregisterServiceWorkers();
  
  // Restore auth state
  for (const [key, value] of Object.entries(authBackup)) {
    localStorage.setItem(key, value);
  }
  console.log('[Cache Reset] Auth state restored');
  
  console.log('[Cache Reset] Results:', { cachesCleared, swsUnregistered });
  
  if (cachesCleared || swsUnregistered) {
    console.log('[Cache Reset] Reloading page...');
    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  } else {
    console.log('[Cache Reset] No caches or SWs to clear');
  }
}

/**
 * Check current cache and SW status
 */
export async function getCacheStatus(): Promise<{
  caches: string[];
  serviceWorkers: number;
}> {
  const cacheNames = 'caches' in window ? await caches.keys() : [];
  const swRegistrations = 'serviceWorker' in navigator 
    ? await navigator.serviceWorker.getRegistrations() 
    : [];
  
  return {
    caches: cacheNames,
    serviceWorkers: swRegistrations.length,
  };
}

// Expose to window for debugging in console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).clearPWACache = fullCacheReset;
  (window as unknown as Record<string, unknown>).getCacheStatus = getCacheStatus;
}
