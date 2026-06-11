/**
 * Hook para consumir banners da tabela mkt_banners local
 * Usado no site Marketing (guilda.app.br)
 */

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MktBanner = Database['public']['Tables']['mkt_banners']['Row'];

export type { MktBanner };

// Verificar dismiss no localStorage
const isDismissedInStorage = (slug: string, hours: number): boolean => {
  const dismissed = localStorage.getItem(`mkt_banner_dismissed_${slug}`);
  if (!dismissed) return false;
  const dismissedAt = new Date(dismissed).getTime();
  const now = Date.now();
  const hoursMs = hours * 60 * 60 * 1000;
  return now - dismissedAt < hoursMs;
};

// Verificar se banner deve aparecer na página atual
const shouldShowOnPage = (banner: MktBanner, pathname: string): boolean => {
  // Se exclude_pages contém a página atual, não mostrar
  if (banner.exclude_pages?.some(p => pathname.startsWith(p))) return false;
  
  // Se pages está vazio ou null, mostrar em todas
  if (!banner.pages || banner.pages.length === 0) return true;
  
  // Se pages tem valores, só mostrar nessas páginas
  return banner.pages.some(p => pathname.startsWith(p));
};

// Fetch banners ativos da tabela local
async function fetchMktBanners(): Promise<MktBanner[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('mkt_banners')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching mkt banners:', error);
    return [];
  }

  return data || [];
}

// Incrementar métricas usando chamada direta (função RPC)
async function incrementMetric(bannerId: string, metric: 'views_count' | 'clicks_count' | 'dismisses_count') {
  try {
    // Usar fetch direto para chamar a função RPC pois os types ainda não foram atualizados
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/increment_mkt_banner_metric`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          banner_id: bannerId,
          metric_name: metric
        })
      }
    );
    
    if (!response.ok) {
      console.error(`Error incrementing ${metric}:`, await response.text());
    }
  } catch (error) {
    console.error(`Error incrementing ${metric}:`, error);
  }
}

export function useMktBanners() {
  return useQuery({
    queryKey: ['mkt-banners'],
    queryFn: fetchMktBanners,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para exibir banners filtrados por página e audience
 */
export function useFilteredMktBanners(type?: MktBanner['type']) {
  const { data: banners = [], isLoading, error } = useMktBanners();
  const location = useLocation();
  const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(new Set());
  const [viewedBanners, setViewedBanners] = useState<Set<string>>(new Set());

  const visibleBanners = useMemo(() => {
    return banners
      .filter(banner => {
        // Filtrar por tipo se especificado
        if (type && banner.type !== type) return false;
        
        // Filtrar por página
        if (!shouldShowOnPage(banner, location.pathname)) return false;
        
        // Filtrar por dismiss (localStorage ou local state)
        if (banner.slug && dismissedLocally.has(banner.slug)) return false;
        if (banner.is_dismissible && banner.slug && isDismissedInStorage(banner.slug, banner.dismiss_duration_hours || 24)) {
          return false;
        }
        
        // No Marketing, só mostrar audience 'all' ou 'anonymous'
        if (!['all', 'anonymous'].includes(banner.audience)) return false;
        
        return true;
      })
      // Ordenar por prioridade (maior primeiro)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [banners, location.pathname, dismissedLocally, type]);

  // Track views para banners visíveis
  useEffect(() => {
    visibleBanners.forEach(banner => {
      if (!viewedBanners.has(banner.id)) {
        incrementMetric(banner.id, 'views_count');
        setViewedBanners(prev => new Set(prev).add(banner.id));
      }
    });
  }, [visibleBanners, viewedBanners]);

  const dismissBanner = useCallback((slug: string, bannerId: string) => {
    localStorage.setItem(`mkt_banner_dismissed_${slug}`, new Date().toISOString());
    setDismissedLocally(prev => new Set(prev).add(slug));
    incrementMetric(bannerId, 'dismisses_count');
  }, []);

  const trackClick = useCallback((bannerId: string) => {
    incrementMetric(bannerId, 'clicks_count');
  }, []);

  return {
    banners: visibleBanners,
    isLoading,
    error,
    dismissBanner,
    trackClick,
  };
}
