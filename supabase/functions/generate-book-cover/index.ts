import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category-based visual prompts
const CATEGORY_VISUALS: Record<string, string> = {
  builder: "deep purple and violet color palette, medieval craftsman guild workshop, gears, hammers, blueprints, drafting tools, mechanical elements",
  seller: "emerald green and teal color palette, medieval merchant guild, treasure maps, gold coins, merchant ships, trading scales, compass",
  universal: "golden amber and orange color palette, grand medieval guild hall, royal crown, ancient scrolls, guild seal, both tools and treasure"
};

// Stage-based visual elements
const STAGE_ELEMENTS: Record<string, string> = {
  idea: "glowing magical lightbulb, floating scrolls with sketches, mystical sparks, dreamy atmosphere",
  mvp: "busy workshop table, prototype tools, work in progress, hands-on creation",
  traction: "bustling medieval marketplace, growing castle city, prosperity, expansion"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { isbn, title, author, category, stage } = await req.json();

    if (!isbn || !title) {
      return new Response(
        JSON.stringify({ error: "ISBN and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if cover already exists
    const { data: existingCover } = await supabase
      .from("book_covers")
      .select("cover_url")
      .eq("isbn", isbn)
      .single();

    if (existingCover?.cover_url) {
      console.log(`Cover already exists for ${isbn}`);
      return new Response(
        JSON.stringify({ cover_url: existingCover.cover_url, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt - more explicit about generating an image
    const categoryVisual = CATEGORY_VISUALS[category] || CATEGORY_VISUALS.universal;
    const stageElement = STAGE_ELEMENTS[stage] || STAGE_ELEMENTS.idea;
    
    const prompt = `Generate an illustrated book cover image.

IMPORTANT: You MUST generate an actual image, not just describe it.

Book: "${title}" by ${author}
Style: Medieval guild manuscript art, watercolor and ink illustration
Colors: ${categoryVisual}
Elements: ${stageElement}

Requirements:
- Illustrated book cover art
- Title "${title.toUpperCase()}" in medieval calligraphy
- Ornate decorative border
- No human faces
- Rich textures

Generate the image now.`;

    console.log(`Generating cover for: ${title} (${isbn})`);

    // Retry logic - up to 3 attempts
    let imageData: string | null = null;
    let lastError: string = "";
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt}/3 for ${isbn}`);
      
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Attempt ${attempt} - AI gateway error:`, response.status, errorText);
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "Payment required" }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          lastError = `AI gateway error: ${response.status}`;
          continue;
        }

        const data = await response.json();
        imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (imageData) {
          console.log(`Image generated on attempt ${attempt}`);
          break;
        } else {
          lastError = "No image in response";
          console.log(`Attempt ${attempt} - No image, response: ${JSON.stringify(data).substring(0, 200)}`);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        console.error(`Attempt ${attempt} error:`, lastError);
      }
      
      // Small delay before retry
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!imageData) {
      console.error(`Failed after 3 attempts for ${isbn}: ${lastError}`);
      return new Response(
        JSON.stringify({ error: `Failed to generate image: ${lastError}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const fileName = `${isbn}.${imageFormat}`;
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(fileName, imageBuffer, {
        contentType: `image/${imageFormat}`,
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(fileName);

    const coverUrl = publicUrlData.publicUrl;

    // Save to database
    const { error: dbError } = await supabase
      .from("book_covers")
      .upsert({
        isbn,
        cover_url: coverUrl,
        category,
        stage,
        generated_at: new Date().toISOString()
      }, { onConflict: "isbn" });

    if (dbError) {
      console.error("Database error:", dbError);
      // Don't fail - we still have the URL
    }

    console.log(`Cover generated successfully: ${coverUrl}`);

    return new Response(
      JSON.stringify({ cover_url: coverUrl, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating book cover:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
