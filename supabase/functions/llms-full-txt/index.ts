import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts, error } = await supabase
      .from("mkt_blog_posts")
      .select("title_pt, slug, excerpt_pt, content_pt, author, published_at, tags")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) throw error;

    const header = `# Guilda - Conteúdo Completo

> Plataforma brasileira de co-founding que conecta Builders (técnicos/desenvolvedores) e Sellers (negócios/marketing/vendas) para criar startups juntos.

Website: https://www.guilda.app.br
Contato: contato@guilda.app.br

---

`;

    const articles = (posts || [])
      .map((post: any) => {
        const date = post.published_at
          ? new Date(post.published_at).toISOString().split("T")[0]
          : "";
        const tags = post.tags?.length ? `Tags: ${post.tags.join(", ")}` : "";
        return `## ${post.title_pt}

URL: https://www.guilda.app.br/blog/${post.slug}
Autor: ${post.author || "Equipe Guilda"}
Publicado: ${date}
${tags}

${post.content_pt || post.excerpt_pt || ""}

---

`;
      })
      .join("");

    const markdown = header + articles;

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("llms-full-txt error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
