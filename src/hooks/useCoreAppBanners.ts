 /**
  * Hook para consumir banners da Core App API
  * Usado no site Marketing (guilda.app.br)
  */
 
 import { useQuery } from '@tanstack/react-query';
 import { useLocation } from 'react-router-dom';
 import { useState, useEffect, useMemo, useCallback } from 'react';
 import { fetchBanners, type CoreBanner } from '@/services/coreApi';
 
 // Slugs de banners que já existem hardcoded no Marketing
 // Evita duplicação com componentes específicos
 const HARDCODED_BANNER_SLUGS = ['social-payment'];
 
 // Verificar dismiss no localStorage
 const isDismissedInStorage = (slug: string, hours: number): boolean => {
   const dismissed = localStorage.getItem(`banner_dismissed_${slug}`);
   if (!dismissed) return false;
   const dismissedAt = new Date(dismissed).getTime();
   const now = Date.now();
   const hoursMs = hours * 60 * 60 * 1000;
   return now - dismissedAt < hoursMs;
 };
 
 // Verificar se banner deve aparecer na página atual
 const shouldShowOnPage = (banner: CoreBanner, pathname: string): boolean => {
   // Se exclude_pages contém a página atual, não mostrar
   if (banner.exclude_pages?.some(p => pathname.startsWith(p))) return false;
   
   // Se pages está vazio, mostrar em todas
   if (!banner.pages || banner.pages.length === 0) return true;
   
   // Se pages tem valores, só mostrar nessas páginas
   return banner.pages.some(p => pathname.startsWith(p));
 };
 
 export function useCoreAppBanners() {
   return useQuery({
     queryKey: ['core-app-banners'],
     queryFn: fetchBanners,
     staleTime: 5 * 60 * 1000, // 5 minutos
     gcTime: 30 * 60 * 1000,   // 30 minutos
     refetchOnWindowFocus: false,
   });
 }
 
 /**
  * Hook para exibir banners filtrados por página e audience
  */
 export function useFilteredBanners(type?: CoreBanner['type']) {
   const { data: banners = [], isLoading, error } = useCoreAppBanners();
   const location = useLocation();
   const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(new Set());
 
   const visibleBanners = useMemo(() => {
     return banners
       .filter(banner => {
         // Filtrar por tipo se especificado
         if (type && banner.type !== type) return false;
         
         // Filtrar por página
         if (!shouldShowOnPage(banner, location.pathname)) return false;
         
         // Filtrar por dismiss (localStorage ou local state)
         if (dismissedLocally.has(banner.slug)) return false;
         if (banner.is_dismissible && isDismissedInStorage(banner.slug, banner.dismiss_duration_hours)) {
           return false;
         }
         
         // No Marketing, só mostrar audience 'all' ou 'anonymous'
         if (!['all', 'anonymous'].includes(banner.audience)) return false;
         
       // Ignorar banners que já existem hardcoded no Marketing
       if (HARDCODED_BANNER_SLUGS.includes(banner.slug)) return false;
       
         return true;
       })
       // Ordenar por prioridade (maior primeiro)
       .sort((a, b) => b.priority - a.priority);
   }, [banners, location.pathname, dismissedLocally, type]);
 
   const dismissBanner = useCallback((slug: string) => {
     localStorage.setItem(`banner_dismissed_${slug}`, new Date().toISOString());
     setDismissedLocally(prev => new Set(prev).add(slug));
   }, []);
 
   return {
     banners: visibleBanners,
     isLoading,
     error,
     dismissBanner,
   };
 }
 
 export type { CoreBanner };