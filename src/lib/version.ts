// Versão do app - atualizar a cada deploy significativo
export const APP_VERSION = '3.5.0';
export const APP_STAGE = 'Alpha' as const; // Alpha, Beta, Stable

// Gera um hash baseado no timestamp do build (injetado pelo Vite)
export const BUILD_HASH = import.meta.env.VITE_BUILD_HASH as string || 
  new Date().toISOString().slice(0, 10).replace(/-/g, '');

// Versão completa para display
export const getFullVersion = () => `v${APP_VERSION} (${BUILD_HASH})`;
export const getShortVersion = () => `v${APP_VERSION}`;

// Tipo para stage
export type AppStage = 'Alpha' | 'Beta' | 'Stable';
