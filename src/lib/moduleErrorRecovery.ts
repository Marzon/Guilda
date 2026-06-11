/**
 * Module Error Recovery
 * 
 * Automatically handles "Failed to fetch dynamically imported module" errors
 * by clearing Service Worker caches and reloading the page.
 */

const isDev = import.meta.env.DEV;

const logRecovery = (message: string, data?: unknown) => {
  if (isDev) {
    console.log(`[ModuleRecovery] ${message}`, data || '');
  }
};

const logError = (message: string, error?: unknown) => {
  if (isDev) {
    console.error(`[ModuleRecovery] ${message}`, error || '');
  }
};

const MODULE_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Loading chunk',
  'Loading CSS chunk',
  'Unable to preload CSS',
  'error loading dynamically imported module',
];

const RECOVERY_KEY = 'module_error_recovery_timestamp';
const RECOVERY_COOLDOWN = 30_000; // 30 seconds between recovery attempts

function isModuleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return MODULE_ERROR_PATTERNS.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

function backupAuthState(): Record<string, string> {
  const backup: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
      backup[key] = localStorage.getItem(key) || '';
    }
  }
  return backup;
}

function restoreAuthState(backup: Record<string, string>): void {
  for (const [key, value] of Object.entries(backup)) {
    localStorage.setItem(key, value);
  }
}

async function clearAllCaches(): Promise<boolean> {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      logRecovery('Clearing caches:', cacheNames);
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    }
  } catch (e) {
    logError('Failed to clear caches:', e);
  }
  return false;
}

async function unregisterServiceWorkers(): Promise<boolean> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      logRecovery('Unregistering service workers:', registrations.length);
      await Promise.all(registrations.map(r => r.unregister()));
      return true;
    }
  } catch (e) {
    logError('Failed to unregister SWs:', e);
  }
  return false;
}

function shouldAttemptRecovery(): boolean {
  const lastRecovery = localStorage.getItem(RECOVERY_KEY);
  if (!lastRecovery) return true;
  
  const timeSinceLastRecovery = Date.now() - parseInt(lastRecovery, 10);
  return timeSinceLastRecovery > RECOVERY_COOLDOWN;
}

function markRecoveryAttempt(): void {
  localStorage.setItem(RECOVERY_KEY, Date.now().toString());
}

async function attemptRecovery(): Promise<void> {
  if (!shouldAttemptRecovery()) {
    logRecovery('Skipping recovery - cooldown active');
    return;
  }

  logRecovery('Attempting automatic recovery...');
  markRecoveryAttempt();

  // Backup auth state before clearing caches
  const authBackup = backupAuthState();
  logRecovery('Auth state backed up:', Object.keys(authBackup).length + ' keys');

  const cachesCleared = await clearAllCaches();
  const swsUnregistered = await unregisterServiceWorkers();

  // Restore auth state after clearing
  restoreAuthState(authBackup);
  logRecovery('Auth state restored');

  if (cachesCleared || swsUnregistered) {
    logRecovery('Caches cleared, reloading page...');
    // Use replace to avoid back button issues
    window.location.replace(window.location.href);
  }
}

export function initModuleErrorRecovery(): void {
  // Handle unhandled promise rejections (dynamic imports fail as rejections)
  window.addEventListener('unhandledrejection', (event) => {
    if (isModuleError(event.reason)) {
      logError('Detected module import error:', event.reason);
      event.preventDefault(); // Prevent default error logging
      attemptRecovery();
    }
  });

  // Handle regular errors
  window.addEventListener('error', (event) => {
    if (isModuleError(event.error || event.message)) {
      logError('Detected module load error:', event.message);
      event.preventDefault();
      attemptRecovery();
    }
  });

  logRecovery('Initialized - watching for dynamic import errors');
}

// Export for manual recovery trigger (e.g., from Settings page)
export async function forceRecovery(): Promise<void> {
  localStorage.removeItem(RECOVERY_KEY);
  await attemptRecovery();
}
