// Centralized URL constants for all edge functions
// This prevents hardcoded URLs scattered across the codebase

export const APP_URL = "https://guilda.app.br";

// Route paths - must match src/lib/routes.ts
export const ROUTES = {
  // Core pages
  tavern: "/tavern",
  profile: "/profile",
  settings: "/settings",
  messages: "/messages",
  auth: "/auth",
  
  // Projects
  createProject: "/create-project",
  projects: "/projects",
  projectDetail: (id: string) => `/projeto/${id}`,
  
  // Navigation pages
  pricing: "/pricing",
  connections: "/conexoes",
  profileViewers: "/quem-viu",
  faq: "/faq",
  myApplications: "/minhas-candidaturas",
  blog: "/blog",
  jobs: "/vagas",
  install: "/install",
  notifications: "/notifications",
  startupCanvas: "/aceleracao/construcao",
  admin: "/admin",
  
  // Tools
  toolsBase: "/ferramentas-empreendedores",
} as const;

// Helper to build full URLs
export const buildUrl = (path: string): string => `${APP_URL}${path}`;

// Common URLs used in emails
export const EMAIL_URLS = {
  tavern: buildUrl(ROUTES.tavern),
  settings: buildUrl(ROUTES.settings),
  createProject: buildUrl(ROUTES.createProject),
  pricing: buildUrl(ROUTES.pricing),
  connections: buildUrl(ROUTES.connections),
  projectDetail: (id: string) => buildUrl(ROUTES.projectDetail(id)),
} as const;
