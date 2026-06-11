import React from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface LinkifyTextProps {
  text: string;
  className?: string;
  isOwnMessage?: boolean;
  hideUrls?: string[]; // URLs to hide (when preview exists)
}

// Regex to match URLs
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

// Guilda internal domains
const GUILDA_DOMAINS = [
  'guilda.app.br',
  'guilda.lovable.app',
  'localhost:8080',
  'localhost:5173'
];

interface InternalLinkInfo {
  type: 'project' | 'tool' | 'profile' | 'tavern' | 'blog' | 'messages' | 'other';
  label: { pt: string; en: string; es: string };
}

const TOOL_NAMES: Record<string, { pt: string; en: string; es: string }> = {
  'equity-calculator': { pt: 'Calculadora de Equity', en: 'Equity Calculator', es: 'Calculadora de Equity' },
  'runway-calculator': { pt: 'Calculadora de Runway', en: 'Runway Calculator', es: 'Calculadora de Runway' },
  'valuation-calculator': { pt: 'Calculadora de Valuation', en: 'Valuation Calculator', es: 'Calculadora de Valuación' },
  'contract-generator': { pt: 'Gerador de Contratos', en: 'Contract Generator', es: 'Generador de Contratos' },
  'unit-economics': { pt: 'Unit Economics', en: 'Unit Economics', es: 'Unit Economics' },
  'cap-table': { pt: 'Cap Table', en: 'Cap Table', es: 'Cap Table' },
  'burn-rate-optimizer': { pt: 'Otimizador de Burn Rate', en: 'Burn Rate Optimizer', es: 'Optimizador de Burn Rate' },
  'tam-sam-som': { pt: 'TAM SAM SOM', en: 'TAM SAM SOM', es: 'TAM SAM SOM' },
  'business-model': { pt: 'Business Model Canvas', en: 'Business Model Canvas', es: 'Business Model Canvas' },
  'empathy-map': { pt: 'Mapa de Empatia', en: 'Empathy Map', es: 'Mapa de Empatía' },
  'customer-dev': { pt: 'Customer Development', en: 'Customer Development', es: 'Customer Development' },
  'swot': { pt: 'Análise SWOT', en: 'SWOT Analysis', es: 'Análisis SWOT' },
  'archetype-quiz': { pt: 'Quiz de Arquétipo', en: 'Archetype Quiz', es: 'Quiz de Arquetipo' },
  'lgpd-guide': { pt: 'Guia LGPD', en: 'LGPD Guide', es: 'Guía LGPD' },
  'recruiting-guide': { pt: 'Guia de Recrutamento', en: 'Recruiting Guide', es: 'Guía de Reclutamiento' },
  'mvp-vibecoding': { pt: 'MVP Vibecoding', en: 'MVP Vibecoding', es: 'MVP Vibecoding' },
  'dataroom-guide': { pt: 'Guia Data Room', en: 'Data Room Guide', es: 'Guía Data Room' },
  // Seller tools
  'markup-calculator': { pt: 'Calculadora de Markup', en: 'Markup Calculator', es: 'Calculadora de Markup' },
  'card-fee-simulator': { pt: 'Simulador de Taxas', en: 'Card Fee Simulator', es: 'Simulador de Tasas' },
  'breakeven-calculator': { pt: 'Ponto de Equilíbrio', en: 'Break-even Calculator', es: 'Punto de Equilibrio' },
  'roi-calculator': { pt: 'Calculadora de ROI', en: 'ROI Calculator', es: 'Calculadora de ROI' },
  'proposal-generator': { pt: 'Gerador de Proposta', en: 'Proposal Generator', es: 'Generador de Propuesta' },
  'business-health-quiz': { pt: 'Termômetro de Negócio', en: 'Business Health Quiz', es: 'Termómetro de Negocio' },
  'company-opening-checklist': { pt: 'Checklist Abertura Empresa', en: 'Company Opening Checklist', es: 'Checklist Apertura Empresa' },
  'cold-outreach': { pt: 'Gerador de Prospecção', en: 'Cold Outreach Generator', es: 'Generador de Prospección' },
  'guilda-ia-mvp': { pt: 'GuildaIA MVP Builder', en: 'GuildaIA MVP Builder', es: 'GuildaIA MVP Builder' },
  'knowledge-roadmap': { pt: 'Cânone da Execução', en: 'Knowledge Roadmap', es: 'Mapa del Conocimiento' },
};

/**
 * Converts legacy WhatsApp URLs to the modern wa.me format
 * Handles: api.whatsapp.com/send?phone=..., web.whatsapp.com/send?phone=...
 */
function normalizeWhatsAppUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's a legacy WhatsApp URL
    if (hostname.includes('whatsapp.com') && urlObj.pathname.includes('/send')) {
      const phone = urlObj.searchParams.get('phone');
      if (phone) {
        // Clean phone number (remove non-digits)
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
      }
    }
    
    return url;
  } catch {
    return url;
  }
}

function getInternalLinkInfo(url: string): InternalLinkInfo | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check if it's a Guilda domain
    if (!GUILDA_DOMAINS.some(domain => hostname.includes(domain.split(':')[0]))) {
      return null;
    }
    
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    
    // Project with showcase review action (both /project/:id and /project/:id/settings)
    if (pathname.match(/^\/project\/[^/]+/) && searchParams.get('showcase_action') === 'review') {
      return {
        type: 'project',
        label: { pt: '✅ Revisar Publicação', en: '✅ Review Publication', es: '✅ Revisar Publicación' }
      };
    }
    
    // Project detail or settings
    if (pathname.startsWith('/project/')) {
      return {
        type: 'project',
        label: { pt: '📂 Ver Projeto', en: '📂 View Project', es: '📂 Ver Proyecto' }
      };
    }
    
    // Tools
    for (const [toolSlug, toolName] of Object.entries(TOOL_NAMES)) {
      if (pathname.includes(toolSlug)) {
        return {
          type: 'tool',
          label: { pt: `🛠️ ${toolName.pt}`, en: `🛠️ ${toolName.en}`, es: `🛠️ ${toolName.es}` }
        };
      }
    }
    
    // Profile
    if (pathname.startsWith('/profile')) {
      return {
        type: 'profile',
        label: { pt: '👤 Ver Perfil', en: '👤 View Profile', es: '👤 Ver Perfil' }
      };
    }
    
    // Tavern
    if (pathname === '/tavern' || pathname.startsWith('/tavern')) {
      return {
        type: 'tavern',
        label: { pt: '🏰 Taverna', en: '🏰 Tavern', es: '🏰 Taberna' }
      };
    }
    
    // Aceleração
    if (pathname === '/aceleracao' || pathname.startsWith('/aceleracao')) {
      return {
        type: 'other',
        label: { pt: '🚀 Aceleração', en: '🚀 Acceleration', es: '🚀 Aceleración' }
      };
    }
    
    // Capital
    if (pathname === '/capital' || pathname.startsWith('/capital')) {
      return {
        type: 'other',
        label: { pt: '💼 Capital', en: '💼 Capital', es: '💼 Capital' }
      };
    }
    
    // Networking
    if (pathname === '/networking' || pathname.startsWith('/networking')) {
      return {
        type: 'other',
        label: { pt: '🤝 Networking', en: '🤝 Networking', es: '🤝 Networking' }
      };
    }
    
    // Blog / Academy
    if (pathname.startsWith('/blog')) {
      return {
        type: 'blog',
        label: { pt: '📚 Academy', en: '📚 Academy', es: '📚 Academy' }
      };
    }
    
    // FAQ
    if (pathname === '/faq' || pathname.startsWith('/faq')) {
      return {
        type: 'other',
        label: { pt: '❓ FAQ', en: '❓ FAQ', es: '❓ FAQ' }
      };
    }
    
    // Messages
    if (pathname.startsWith('/messages') || pathname.startsWith('/chat')) {
      return {
        type: 'messages',
        label: { pt: '💬 Conversa', en: '💬 Conversation', es: '💬 Conversación' }
      };
    }
    
    // Other internal pages
    if (pathname === '/projects') {
      return {
        type: 'other',
        label: { pt: '📋 Startups', en: '📋 Startups', es: '📋 Startups' }
      };
    }
    
    if (pathname === '/tools') {
      return {
        type: 'other',
        label: { pt: '🧰 Ferramentas', en: '🧰 Tools', es: '🧰 Herramientas' }
      };
    }
    
    // Generic internal link
    return {
      type: 'other',
      label: { pt: '🔗 Ver no Guilda', en: '🔗 View on Guilda', es: '🔗 Ver en Guilda' }
    };
  } catch {
    return null;
  }
}

export const LinkifyText = ({ text, className, isOwnMessage = false, hideUrls = [] }: LinkifyTextProps) => {
  const { currentLanguage } = useLanguage();
  
  if (!text) return null;

  const parts = text.split(urlRegex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Reset regex lastIndex
          urlRegex.lastIndex = 0;
          
          // Check if this URL should be hidden (preview exists)
          if (hideUrls.includes(part)) {
            return null;
          }
          
          // Normalize legacy WhatsApp URLs to wa.me format
          const normalizedUrl = normalizeWhatsAppUrl(part);
          
          // Check for internal Guilda link
          const internalInfo = getInternalLinkInfo(normalizedUrl);
          const displayText = internalInfo 
            ? internalInfo.label[currentLanguage as 'pt' | 'en' | 'es'] || internalInfo.label.en
            : normalizedUrl;
          
          return (
            <a
              key={index}
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline break-all underline ${
                isOwnMessage 
                  ? "text-white/90 hover:text-white" 
                  : "text-primary hover:text-primary/80"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {displayText}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
