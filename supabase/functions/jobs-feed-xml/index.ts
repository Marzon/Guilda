// Jobs Feed XML - RSS 2.0 for job aggregators (Indeed, Jooble, LinkedIn)

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
    // Fetch jobs from Core App's public-stats API
    const CORE_API_URL = "https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1";
    let roles: any[] = [];
    const statsResponse = await fetch(`${CORE_API_URL}/public-stats`);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      roles = statsData.open_jobs || [];
    } else {
      console.error("Failed to fetch public-stats:", statsResponse.status);
      throw new Error("Failed to fetch jobs data");
    }

    const now = new Date();
    const pubDate = toRFC822(now);
    const baseUrl = "https://www.guilda.app.br";

    const items = (roles || [])
      .map((role: any) => {
        const project = role.project;
        const projectTitle = project?.title || "Projeto na Guilda";
        const ownerUsername = project?.owner?.username || "guilda";
        const jobUrl = `${baseUrl}/vagas/${role.id}`;
        const description = role.role_description || `Vaga para ${role.role_name} no projeto ${projectTitle}`;
        const skills = (role.required_skills || []).join(", ");
        const archetype = role.required_archetype || "Qualquer";

        return `    <item>
      <title>${escapeXml(`${role.role_name} - ${projectTitle}`)}</title>
      <link>${escapeXml(jobUrl)}</link>
      <description><![CDATA[${description}${skills ? `\n\nSkills: ${skills}` : ""}${archetype !== "Qualquer" ? `\nPerfil: ${archetype}` : ""}]]></description>
      <pubDate>${toRFC822(new Date(role.created_at))}</pubDate>
      <guid isPermaLink="true">${escapeXml(jobUrl)}</guid>
      <source url="${baseUrl}">Guilda</source>
      <category>${escapeXml(archetype)}</category>
      
      <dc:creator>${escapeXml(ownerUsername)}</dc:creator>
      <job:company>Guilda</job:company>
      <job:location>Remoto</job:location>
      <job:type>Cofundador</job:type>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:job="https://www.guilda.app.br/ns/job">
  <channel>
    <title>Vagas na Guilda - Encontre seu cofundador</title>
    <link>${baseUrl}/vagas</link>
    <description>Vagas abertas para cofundadores na Guilda. Encontre projetos que precisam do seu perfil.</description>
    <language>pt-BR</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <generator>Guilda Jobs Feed</generator>
    <atom:link href="${baseUrl}/api/jobs-feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>Guilda</title>
      <link>${baseUrl}</link>
    </image>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Jobs feed error:", err);
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

function toRFC822(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const d = days[date.getUTCDay()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  
  return `${d}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
}
