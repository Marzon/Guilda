/**
 * URL utility functions for preserving tracking parameters
 * across redirects to the Core App
 */

/**
 * Gets the current URL query parameters as a string
 * Useful for preserving fbclid, utm_source, utm_medium, etc.
 */
export function getCurrentQueryParams(): string {
  if (typeof window === 'undefined') return '';
  return window.location.search;
}

/**
 * Builds a URL to the Core App preserving current query parameters
 * @param baseUrl - The base URL (e.g., 'https://suprema.guilda.app.br')
 * @param path - The path to append (e.g., '/auth')
 * @returns Full URL with preserved query parameters
 */
export function buildCoreAppUrl(baseUrl: string, path: string): string {
  const currentParams = getCurrentQueryParams();
  const url = `${baseUrl}${path}`;
  
  // If URL already has query params, merge them
  if (currentParams) {
    const separator = url.includes('?') ? '&' : '?';
    // Remove the leading '?' from currentParams when appending
    return `${url}${separator}${currentParams.slice(1)}`;
  }
  
  return url;
}

/**
 * Redirects to the Core App preserving current query parameters
 * @param baseUrl - The base URL
 * @param path - The path to redirect to
 */
export function redirectToCoreApp(baseUrl: string, path: string): void {
  window.location.href = buildCoreAppUrl(baseUrl, path);
}
