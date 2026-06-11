import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminError = await requireAdmin(supabase, user.id, corsHeaders);
    if (adminError) return adminError;

    const pexelsKey = Deno.env.get("PEXELS_API_KEY");
    if (!pexelsKey) {
      return new Response(JSON.stringify({ error: "PEXELS_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Find duplicate covers
    const { data: dupeData } = await supabase
      .from("mkt_blog_posts")
      .select("cover_image")
      .eq("is_published", true)
      .not("cover_image", "is", null);

    const coverCounts: Record<string, number> = {};
    for (const row of dupeData || []) {
      if (row.cover_image) {
        coverCounts[row.cover_image] = (coverCounts[row.cover_image] || 0) + 1;
      }
    }
    const duplicateCovers = new Set(
      Object.entries(coverCounts)
        .filter(([_, count]) => count > 1)
        .map(([url]) => url)
    );

    // Get posts that need new covers
    const { data: posts, error: postsError } = await supabase
      .from("mkt_blog_posts")
      .select("id, slug, title_pt, tags, cover_image")
      .eq("is_published", true);

    if (postsError) throw postsError;

    const needsUpdate = (posts || []).filter(
      (p: any) => !p.cover_image || duplicateCovers.has(p.cover_image)
    );

    console.log(`Found ${needsUpdate.length} posts needing cover update`);

    // PT → EN translation map
    const PT_EN: Record<string, string> = {
      cofundador: "cofounder", cofundadora: "cofounder", encontrar: "find",
      técnico: "technical", tecnico: "technical", negócio: "business",
      negócios: "business", investidor: "investor", investimento: "investment",
      empreendedor: "entrepreneur", startup: "startup", produto: "product",
      mercado: "market", vendas: "sales", crescimento: "growth", equipe: "team",
      fundador: "founder", tecnologia: "technology", inovação: "innovation",
      cliente: "customer", marketing: "marketing", estratégia: "strategy",
      financeiro: "finance", financiamento: "funding", validação: "validation",
      liderança: "leadership", gestão: "management", parceiro: "partner",
      parceria: "partnership", sociedade: "partnership", sócio: "partner",
      receita: "revenue", lucro: "profit", escalar: "scale", pitch: "pitch",
      mentoria: "mentorship", networking: "networking", comunidade: "community",
      software: "software", desenvolvimento: "development", código: "code",
      projeto: "project", cultura: "culture", contrato: "contract",
      contratação: "hiring", salário: "salary", métricas: "metrics",
      equity: "equity", vesting: "vesting", builder: "builder", seller: "seller",
    };

    function translateTag(tag: string): string {
      return tag.toLowerCase().split(/\s+/)
        .map((w) => {
          const n = w.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return PT_EN[n] || PT_EN[w] || w;
        })
        .filter((w) => w.length > 2).slice(0, 3).join(" ");
    }

    function buildQuery(tags: string[]): string {
      const seen = new Set<string>();
      const terms: string[] = [];
      for (const tag of tags) {
        for (const word of translateTag(tag).split(" ")) {
          const key = word.toLowerCase();
          if (!seen.has(key) && key.length > 2) { seen.add(key); terms.push(word); }
          if (terms.length >= 5) break;
        }
        if (terms.length >= 5) break;
      }
      return terms.join(" ");
    }

    const results: any[] = [];
    const usedImageIds = new Set<number>();

    for (const post of needsUpdate) {
      const query = buildQuery(post.tags || []);
      if (!query) { results.push({ slug: post.slug, status: "skipped", reason: "no tags" }); continue; }

      await new Promise((r) => setTimeout(r, 300));

      const params = new URLSearchParams({ query, per_page: "15", orientation: "landscape", size: "large" });
      const res = await fetch(`https://api.pexels.com/v1/search?${params}`, { headers: { Authorization: pexelsKey } });

      if (!res.ok) { results.push({ slug: post.slug, status: "error", reason: `Pexels ${res.status}` }); continue; }

      const data = await res.json();
      const photo = (data.photos || []).find((p: any) => !usedImageIds.has(p.id));
      if (!photo) { results.push({ slug: post.slug, status: "no_results", query }); continue; }

      usedImageIds.add(photo.id);
      const imageUrl = photo.src?.large2x || photo.src?.large;

      const { error: updateError } = await supabase.from("mkt_blog_posts").update({ cover_image: imageUrl }).eq("id", post.id);
      results.push(updateError
        ? { slug: post.slug, status: "update_error", error: updateError.message }
        : { slug: post.slug, status: "updated", query, imageUrl });
    }

    return new Response(JSON.stringify({ total: needsUpdate.length, results }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("batch-update-covers error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
