/**
 * PWA utility functions
 * PWA installation is handled by the Core App (suprema.guilda.app.br)
 * This file keeps helper utilities for detecting standalone mode
 */

import { CORE_APP_URL } from "./constants";
import { buildCoreAppUrl } from "./url-utils";

/**
 * Checks if the app is running as a PWA (installed)
 */
export function isPWAInstalled(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  if ((navigator as any).standalone === true) {
    return true;
  }
  return false;
}

/**
 * Opens the Core App at the specified path, preserving query parameters
 */
export function openCoreApp(path: string = "/"): void {
  window.location.href = buildCoreAppUrl(CORE_APP_URL, path);
}

/**
 * Checks if the current device is mobile
 */
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}
