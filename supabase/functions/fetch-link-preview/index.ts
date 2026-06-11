import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

function extractMetaContent(html: string, property: string): string | null {
  // Try og: properties first
  const ogRegex = new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i');
  const ogMatch = html.match(ogRegex);
  if (ogMatch) return ogMatch[1];

  // Try reversed order (content before property)
  const ogReversedRegex = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i');
  const ogReversedMatch = html.match(ogReversedRegex);
  if (ogReversedMatch) return ogReversedMatch[1];

  // Try name attribute for description
  if (property === 'description') {
    const nameRegex = new RegExp(`<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']`, 'i');
    const nameMatch = html.match(nameRegex);
    if (nameMatch) return nameMatch[1];

    const nameReversedRegex = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']`, 'i');
    const nameReversedMatch = html.match(nameReversedRegex);
    if (nameReversedMatch) return nameReversedMatch[1];
  }

  return null;
}

function extractTitle(html: string): string | null {
  const ogTitle = extractMetaContent(html, 'title');
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  // Try to find link rel="icon" or rel="shortcut icon"
  const iconRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i;
  const iconMatch = html.match(iconRegex);
  
  if (iconMatch) {
    const href = iconMatch[1];
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) {
      const url = new URL(baseUrl);
      return `${url.origin}${href}`;
    }
    return `${baseUrl}/${href}`;
  }

  // Default to /favicon.ico
  try {
    const url = new URL(baseUrl);
    return `${url.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      console.log(`Fetching URL: ${url}`);
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);
      console.log(`Response status: ${response.status}`);
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error(`Fetch error for ${url}:`, fetchError);
      // Return minimal preview with just the URL info
      return new Response(
        JSON.stringify({
          url,
          title: parsedUrl.hostname,
          description: null,
          image: null,
          siteName: parsedUrl.hostname,
          favicon: `${parsedUrl.origin}/favicon.ico`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      console.log(`Non-OK response (${response.status}) for ${url}, returning minimal preview`);
      // Return minimal preview instead of error
      return new Response(
        JSON.stringify({
          url,
          title: parsedUrl.hostname,
          description: null,
          image: null,
          siteName: parsedUrl.hostname,
          favicon: `${parsedUrl.origin}/favicon.ico`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    const preview: LinkPreview = {
      url,
      title: extractTitle(html),
      description: extractMetaContent(html, 'description'),
      image: extractMetaContent(html, 'image'),
      siteName: extractMetaContent(html, 'site_name') || parsedUrl.hostname,
      favicon: extractFavicon(html, url),
    };

    // Make image URL absolute if relative
    if (preview.image && !preview.image.startsWith('http')) {
      if (preview.image.startsWith('//')) {
        preview.image = `https:${preview.image}`;
      } else if (preview.image.startsWith('/')) {
        preview.image = `${parsedUrl.origin}${preview.image}`;
      }
    }

    return new Response(
      JSON.stringify(preview),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching link preview:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch link preview' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
