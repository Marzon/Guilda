 /**
  * Core App API Service
  * Comunicação com a API do Core App (suprema.guilda.app.br)
  */
 
 const CORE_API_URL = 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/api-proxy';
 const API_KEY = 'gld_mkt_prod_8f42b1c35d9e4a7bb2e19c3f4d5a6e7b_2024';
 
 export interface CoreBanner {
   id: string;
   slug: string;
   name: string;
   title: string;
   description: string | null;
   type: 'top_bar' | 'modal' | 'inline' | 'floating';
   variant: 'default' | 'gradient' | 'custom';
   audience: 'all' | 'free' | 'premium' | 'authenticated' | 'anonymous';
   icon: string | null;
   image_url: string | null;
   custom_bg_color: string | null;
   custom_text_color: string | null;
   custom_gradient: string | null;
   cta_text: string | null;
   cta_link: string | null;
   secondary_cta_text: string | null;
   secondary_cta_link: string | null;
   is_dismissible: boolean;
   dismiss_duration_hours: number;
   pages: string[];
   exclude_pages: string[];
   priority: number;
   start_date: string | null;
   end_date: string | null;
 }
 
 interface BannerResponse {
   success: boolean;
   data: CoreBanner[];
   meta: {
     total_count: number;
   };
   cached_at: string;
 }
 
 /**
  * Busca banners ativos da Core App API
  */
 export async function fetchBanners(): Promise<CoreBanner[]> {
   try {
     const response = await fetch(`${CORE_API_URL}?endpoint=banners`, {
       headers: {
         'x-api-key': API_KEY,
       },
     });
 
     if (!response.ok) {
       console.error('Failed to fetch banners:', response.status);
       return [];
     }
 
     const data: BannerResponse = await response.json();
     return data.success ? data.data : [];
   } catch (error) {
     console.error('Error fetching banners:', error);
     return [];
   }
 }