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

    // Fetch static sitemap entries
    const { data: entries, error } = await supabase
      .from("mkt_sitemap_entries")
      .select("url, changefreq, priority, last_modified")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (error) throw error;

    // Fetch active job listings from Core App's public-stats API
    const CORE_API_URL = "https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1";
    let jobs: any[] = [];
    try {
      const statsResponse = await fetch(`${CORE_API_URL}/public-stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        jobs = statsData.open_jobs || [];
      } else {
        console.error("Failed to fetch public-stats:", statsResponse.status);
      }
    } catch (fetchErr) {
      console.error("Jobs fetch error:", fetchErr);
    }

    const staticUrls = (entries || [])
      .map(
        (e: any) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${e.last_modified ? e.last_modified.split("T")[0] : new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${e.changefreq || "monthly"}</changefreq>
    <priority>${e.priority ?? 0.5}</priority>
  </url>`
      )
      .join("\n");

    const jobUrls = (jobs || [])
      .map(
        (j: any) => `  <url>
    <loc>https://www.guilda.app.br/vagas/${j.id}</loc>
    <lastmod>${j.created_at ? j.created_at.split("T")[0] : new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join("\n");

    const allUrls = [staticUrls, jobUrls].filter(Boolean).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
