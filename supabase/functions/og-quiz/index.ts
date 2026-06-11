import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORAGE_BASE = "https://kcyyelhrxlpjdujmtytm.supabase.co/storage/v1/object/public/quiz-reports";

const archetypes: Record<string, { title: string; description: string; image: string }> = {
  mago: {
    title: 'Mago do Código',
    description: 'Você transforma problemas em código — e código em produto.',
    image: 'og-mago.png',
  },
  arquiteto: {
    title: 'Arquiteto Visionário',
    description: 'Você não constrói features — você projeta sistemas.',
    image: 'og-arquiteto.png',
  },
  paladino: {
    title: 'Paladino de Vendas',
    description: 'Você não espera o mercado vir até você — você vai até ele.',
    image: 'og-paladino.png',
  },
  estrategista: {
    title: 'Estrategista Arcano',
    description: 'Você enxerga o tabuleiro enquanto outros olham só a próxima jogada.',
    image: 'og-estrategista.png',
  },
  ranger: {
    title: 'Ranger Híbrido',
    description: 'Você faz o que precisa ser feito — não importa o que seja.',
    image: 'og-ranger.png',
  },
  comandante: {
    title: 'Comandante da Guilda',
    description: 'Você constrói times que fazem produto e fecham deals.',
    image: 'og-comandante.png',
  },
};

const SOCIAL_CRAWLERS = [
  'linkedinbot', 'facebookexternalhit', 'facebot', 'twitterbot',
  'whatsapp', 'slackbot', 'telegrambot', 'discordbot', 'googleother', 'bingbot',
];

function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some(bot => ua.includes(bot));
}

serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get('a') || 'mago';
  const a = archetypes[key] || archetypes.mago;
  const imageUrl = `${STORAGE_BASE}/${a.image}`;
  const quizUrl = `https://guilda.app.br/quiz-empreendedor?resultado=${key}`;
  const userAgent = req.headers.get('user-agent');

  // Non-bot: redirect to quiz page
  if (!isSocialCrawler(userAgent)) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: quizUrl },
    });
  }

  // Bot: serve OG meta tags
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Sou ${a.title} — Descubra seu arquétipo de empreendedor | Guilda</title>
  <meta name="description" content="${a.description}" />
  <meta property="og:title" content="Sou ${a.title} — Descubra seu arquétipo de empreendedor" />
  <meta property="og:description" content="${a.description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1200" />
  <meta property="og:url" content="${quizUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Guilda" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Sou ${a.title} — Descubra seu arquétipo" />
  <meta name="twitter:description" content="${a.description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="canonical" href="${quizUrl}" />
</head>
<body>
  <h1>Sou ${a.title}</h1>
  <p>${a.description}</p>
  <a href="${quizUrl}">Fazer o quiz</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});
