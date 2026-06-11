// API Configuration for Guilda Marketing Site
// Consumes data from Core App via local core-proxy edge function

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://api.guilda.app.br';

export const CORE_API = {
  baseUrl: `${SUPABASE_URL}/functions/v1/core-proxy`,
  
  // Headers for API calls (no API key needed - handled by edge function)
  getHeaders: () => ({
    'Content-Type': 'application/json',
  }),

  // Build URL with query params
  buildUrl: (endpoint: string, params?: Record<string, string | number>) => {
    const url = new URL(CORE_API.baseUrl);
    url.searchParams.set('endpoint', endpoint);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    
    return url.toString();
  },

  // Core App URLs for redirects
  app: {
    base: 'https://suprema.guilda.app.br',
    auth: 'https://suprema.guilda.app.br/auth',
    project: (id: string) => `https://suprema.guilda.app.br/projeto/${id}`,
    applyToRole: (projectId: string, roleId: string) => 
      `https://suprema.guilda.app.br/projeto/${projectId}?apply=${roleId}`,
    profile: (username: string) => `https://suprema.guilda.app.br/u/${username}`,
    tavern: 'https://suprema.guilda.app.br/tavern',
    createProject: 'https://suprema.guilda.app.br/create-project',
    pricing: 'https://suprema.guilda.app.br/pricing',
  },
};
