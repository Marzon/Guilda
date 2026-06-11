/**
 * Utility for localized routes
 * Maps original routes to localized versions based on language
 */

export type Language = 'en' | 'pt' | 'es';

const ptRoutes: Record<string, string> = {
  '/tools': '/ferramentas-empreendedores',
  '/builders': '/desenvolvedores',
  '/sellers': '/vendedores',
  '/starters': '/iniciantes',
  '/investors': '/investidores',
};

/**
 * Returns a localized path for Portuguese, or the original path for other languages
 */
export const getLocalizedPath = (path: string, language: string): string => {
  if (language !== 'pt') return path;
  return ptRoutes[path] || path;
};

/**
 * Returns the original path from a localized path (reverse lookup)
 */
export const getOriginalPath = (localizedPath: string): string => {
  const reversePtRoutes = Object.entries(ptRoutes).reduce((acc, [original, localized]) => {
    acc[localized] = original;
    return acc;
  }, {} as Record<string, string>);
  
  return reversePtRoutes[localizedPath] || localizedPath;
};
