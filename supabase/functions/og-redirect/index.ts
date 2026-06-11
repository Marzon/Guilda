import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map of paths to their OG meta data
const OG_META_MAP: Record<string, {
  title: string;
  description: string;
  image: string;
  url: string;
}> = {
  '/ferramentas-empreendedores/guilda-ia-mvp': {
    title: 'GuildaIA MVP Builder - Crie seu MVP com IA',
    description: 'Transforme sua ideia em um prompt profissional para criar seu MVP com inteligência artificial. Grátis, em 2 minutos.',
    image: 'https://www.guilda.app.br/og-guilda-ia-mvp.png',
    url: 'https://www.guilda.app.br/ferramentas-empreendedores/guilda-ia-mvp',
  },
};

// Social crawler user agents
const SOCIAL_CRAWLERS = [
  'facebookexternalhit',
  'Facebot',
  'LinkedInBot',
  'Twitterbot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'GoogleOther',
  'bingbot',
];

function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return SOCIAL_CRAWLERS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

function generateHTML(meta: typeof OG_META_MAP[string]): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Guilda" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${meta.image}" />
  <link rel="canonical" href="${meta.url}" />
</head>
<body>
  <h1>${meta.title}</h1>
  <p>${meta.description}</p>
  <a href="${meta.url}">Acessar ferramenta</a>
</body>
</html>`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';
    const userAgent = req.headers.get('user-agent');

    // Only serve prerendered HTML for social crawlers
    if (!isSocialCrawler(userAgent)) {
      return new Response(JSON.stringify({ redirect: true, path }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const meta = OG_META_MAP[path];
    if (!meta) {
      return new Response(JSON.stringify({ redirect: true, path }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(generateHTML(meta), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
