// Lovable API "Build with URL" integration
// Docs: https://docs.lovable.dev/features/build-with-url

export interface LovableUrlParams {
  prompt: string;
  images?: string[];
}

export interface MvpFormData {
  idea: string;
  targetAudience: string;
  features: string[];
  style: 'modern' | 'startup' | 'professional' | 'playful';
  customFeatures?: string;
}

/**
 * Builds a Lovable URL with the given prompt and optional images
 * @param params - The prompt and optional images to include
 * @returns The complete Lovable URL
 */
export const buildLovableUrl = ({ prompt, images = [] }: LovableUrlParams): string => {
  const baseUrl = 'https://lovable.dev/invite/3DDMN6I?autosubmit=true#';
  
  // Limit prompt to 50k characters as per API docs
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 50000));
  
  let url = `${baseUrl}prompt=${encodedPrompt}`;
  
  // Add up to 10 images as per API docs
  images.slice(0, 10).forEach(img => {
    url += `&images=${encodeURIComponent(img)}`;
  });
  
  return url;
};

/**
 * Maps style option to visual description
 */
const getStyleDescription = (style: MvpFormData['style']): string => {
  const styles = {
    modern: 'Design moderno e minimalista com muito espaço em branco, tipografia clean, cores neutras com acentos sutis. Inspirado em apps como Linear, Notion, Vercel.',
    startup: 'Design tech/startup com gradientes vibrantes, bordas arredondadas, sombras suaves, dark mode. Inspirado em Stripe, Figma, Discord.',
    professional: 'Design corporativo e profissional com cores sóbrias (azul, cinza), layout estruturado, fonte serif para títulos. Inspirado em Salesforce, LinkedIn.',
    playful: 'Design divertido e colorido com ilustrações, cores vibrantes, animações sutis, bordas arredondadas. Inspirado em Duolingo, Slack.',
  };
  return styles[style];
};

/**
 * Maps feature keys to full descriptions
 */
const getFeatureDescription = (feature: string): string => {
  const features: Record<string, string> = {
    auth: 'Sistema de autenticação completo (login, cadastro, recuperação de senha, perfil do usuário)',
    payments: 'Integração com pagamentos online (checkout, histórico de transações, planos/assinaturas)',
    chat: 'Chat em tempo real entre usuários com indicador de digitação e leitura',
    dashboard: 'Dashboard administrativo com métricas, gráficos e gestão de dados',
    notifications: 'Sistema de notificações push e in-app',
    search: 'Busca avançada com filtros e ordenação',
    upload: 'Upload de arquivos e imagens com preview',
    responsive: 'Layout totalmente responsivo para mobile, tablet e desktop',
  };
  return features[feature] || feature;
};

/**
 * Builds a structured MVP prompt from form data
 * @param data - The form data from the MVP builder
 * @returns A well-structured prompt for Lovable
 */
export const buildMvpPrompt = (data: MvpFormData): string => {
  const featuresDescription = data.features
    .map(f => `- ${getFeatureDescription(f)}`)
    .join('\n');

  const customFeaturesSection = data.customFeatures 
    ? `\n\n### Funcionalidades Adicionais\n${data.customFeatures}`
    : '';

  return `# Criar MVP Web Completo

## Sobre o Projeto
${data.idea}

## Público-Alvo
${data.targetAudience}

## Funcionalidades Principais
${featuresDescription}${customFeaturesSection}

## Estilo Visual
${getStyleDescription(data.style)}

## Requisitos Técnicos
- React com TypeScript
- Tailwind CSS para estilização
- Componentes shadcn/ui
- Layout responsivo (mobile-first)
- Acessibilidade (WCAG 2.1 AA)
- SEO básico (meta tags, títulos, descrições)

## Estrutura Esperada
1. **Landing Page**: Hero section com proposta de valor, benefícios, como funciona, depoimentos, FAQ, CTA
2. **Páginas internas**: Conforme funcionalidades selecionadas
3. **Navegação**: Header com menu, footer com links úteis
4. **Estados**: Loading, empty, error states bem tratados

## Qualidade
- Código limpo e bem organizado
- Componentes reutilizáveis
- Tipagem TypeScript completa
- Mensagens e textos em português brasileiro

Comece criando a estrutura principal e a landing page.`;
};

/**
 * Opens the Lovable URL in a new tab
 * @param url - The Lovable URL to open
 */
export const openLovableUrl = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
