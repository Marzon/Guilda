import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { ADMIN_USER_ID } from "../_shared/admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Default project titles that should trigger a suggestion
const DEFAULT_TITLES = [
  "Meu SaaS B2B",
  "Meu App Mobile",
  "Meu Game",
  "Meu Marketplace",
  "Minha EdTech",
  "Minha GreenTech",
  "Minha HealthTech",
  "Minha FinTech",
];

// Delay in milliseconds before checking criteria (allows roles/links to be saved)
const DELAY_MS = 5000;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { project_id, owner_id } = await req.json();

    if (!project_id || !owner_id) {
      console.error("Missing required fields: project_id or owner_id");
      return new Response(
        JSON.stringify({ error: "Missing project_id or owner_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing auto-comment for project: ${project_id}, owner: ${owner_id}`);

    // Wait for roles and links to be saved
    console.log(`Waiting ${DELAY_MS}ms for roles/links to be saved...`);
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title, description, owner_id, is_showcase, is_demo")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      console.error("Project not found:", projectError);
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Skip admin's own projects, showcase, or demo projects
    if (project.owner_id === ADMIN_USER_ID || project.is_showcase || project.is_demo) {
      console.log("Skipping auto-comment for admin/showcase/demo project");
      return new Response(
        JSON.stringify({ skipped: true, reason: "admin/showcase/demo project" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get owner's archetype
    const { data: profile } = await supabase
      .from("profiles")
      .select("archetype")
      .eq("id", owner_id)
      .single();

    const ownerArchetype = profile?.archetype || null;

    // Check for existing links
    const { count: linksCount } = await supabase
      .from("project_links")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project_id);

    const hasLinks = (linksCount || 0) > 0;

    // Check for existing roles
    const { count: rolesCount } = await supabase
      .from("project_roles")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project_id);

    const hasRoles = (rolesCount || 0) > 0;

    // Check if a comment from admin already exists (avoid duplicates)
    const { count: existingComments } = await supabase
      .from("project_comments")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project_id)
      .eq("author_id", ADMIN_USER_ID);

    if ((existingComments || 0) > 0) {
      console.log("Admin comment already exists, skipping");
      return new Response(
        JSON.stringify({ skipped: true, reason: "comment already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build comment parts
    const commentParts: string[] = [];

    // 1. Check default title
    if (DEFAULT_TITLES.includes(project.title)) {
      commentParts.push(
        "📝 **Sobre o nome:** Percebi que seu projeto ainda está com o nome padrão. Um nome único e memorável ajuda investidores e cofundadores a lembrarem do seu projeto. Que tal personalizar?"
      );
    }

    // 2. Check missing links
    if (!hasLinks) {
      commentParts.push(
        "🔗 **Sobre os links:** Notei que você ainda não cadastrou nenhum link. Links como site, pitch deck ou protótipo ajudam outros fundadores a entenderem melhor sua visão e aumentam a credibilidade do projeto."
      );
    }

    // 3. Check short description
    const descriptionLength = (project.description || "").length;
    if (descriptionLength < 100) {
      commentParts.push(
        "📖 **Sobre a descrição:** Sua descrição está bem resumida! Uma descrição mais detalhada (100+ caracteres) ajuda outros fundadores a entenderem o problema que você resolve e o diferencial da sua solução."
      );
    }

    // 4. Check missing roles with archetype-specific suggestion
    if (!hasRoles) {
      let roleSuggestion: string;

      switch (ownerArchetype) {
        case "SELLER":
          roleSuggestion =
            "👥 **Sobre vagas:** Você está buscando alguém técnico para ajudar? Que tal cadastrar uma vaga de CTO ou Co-fundador(a) Técnico para complementar seu perfil de negócios?";
          break;
        case "BUILDER":
          roleSuggestion =
            "👥 **Sobre vagas:** Você está buscando alguém de negócios? Que tal cadastrar uma vaga de CMO ou Co-fundador(a) de Marketing para complementar seu perfil técnico?";
          break;
        case "STARTER":
          roleSuggestion =
            "👥 **Sobre vagas:** Você está começando sua jornada empreendedora! Que tal cadastrar uma vaga de Co-fundador(a) para encontrar alguém para essa aventura?";
          break;
        case "INVESTOR":
          roleSuggestion =
            "👥 **Sobre vagas:** Você está buscando executar esse projeto? Que tal cadastrar vagas para os papéis chave que você precisa preencher?";
          break;
        default:
          roleSuggestion =
            "👥 **Sobre vagas:** Notei que você ainda não publicou nenhuma vaga. Cadastrar vagas ajuda outros fundadores a encontrarem você!";
      }

      commentParts.push(roleSuggestion);
    }

    // Only insert comment if there are suggestions
    if (commentParts.length === 0) {
      console.log("No suggestions needed for this project");
      return new Response(
        JSON.stringify({ success: true, commented: false, reason: "no suggestions needed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build final comment
    const finalComment =
      "Olá! Parabéns por cadastrar seu projeto! 🚀\n\n" +
      "Analisei rapidamente e tenho algumas sugestões para você:\n\n" +
      commentParts.join("\n\n") +
      "\n\n" +
      "Qualquer dúvida, me chama no chat! Estou aqui para ajudar. 💪";

    // Insert the comment
    const { error: insertError } = await supabase.from("project_comments").insert({
      project_id: project_id,
      author_id: ADMIN_USER_ID,
      content: finalComment,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error inserting comment:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to insert comment", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully added auto-comment with ${commentParts.length} suggestions`);

    return new Response(
      JSON.stringify({
        success: true,
        commented: true,
        suggestionsCount: commentParts.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
