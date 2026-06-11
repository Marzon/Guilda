import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileData {
  id: string;
  username: string;
  archetype: string;
  bio: string | null;
  stats: { code?: number; design?: number; marketing?: number };
  skills: { name: string; category: string; proficiency: number }[];
  avatar_url?: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { userId } = await req.json();
    if (!userId) {
      throw new Error("userId is required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current user's profile with skills
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, archetype, bio, stats, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError || !currentProfile) {
      throw new Error("Failed to fetch user profile");
    }

    // Fetch current user's skills
    const { data: currentUserSkills } = await supabase
      .from("user_skills")
      .select(`
        proficiency_level,
        skills (name, category)
      `)
      .eq("user_id", userId);

    const currentSkills = currentUserSkills?.map(us => ({
      name: (us.skills as any)?.name,
      category: (us.skills as any)?.category,
      proficiency: us.proficiency_level
    })) || [];

    // Fetch other profiles (excluding current user)
    const { data: otherProfiles, error: othersError } = await supabase
      .from("profiles")
      .select("id, username, archetype, bio, stats, avatar_url")
      .neq("id", userId)
      .limit(50);

    if (othersError || !otherProfiles?.length) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch banned users to exclude
    const { data: bannedUsers } = await supabase
      .from("banned_users")
      .select("user_id")
      .or("expires_at.is.null,expires_at.gt.now()");

    const bannedUserIds = new Set(bannedUsers?.map(b => b.user_id) || []);

    // Fetch skills for all other profiles
    const otherUserIds = otherProfiles.map(p => p.id);
    const { data: allOtherSkills } = await supabase
      .from("user_skills")
      .select(`
        user_id,
        proficiency_level,
        skills (name, category)
      `)
      .in("user_id", otherUserIds);

    // Group skills by user
    const skillsByUser: Record<string, { name: string; category: string; proficiency: number }[]> = {};
    allOtherSkills?.forEach(us => {
      if (!skillsByUser[us.user_id]) skillsByUser[us.user_id] = [];
      skillsByUser[us.user_id].push({
        name: (us.skills as any)?.name,
        category: (us.skills as any)?.category,
        proficiency: us.proficiency_level
      });
    });

    // Get users with skills
    const usersWithSkillsSet = new Set(Object.keys(skillsByUser).filter(id => skillsByUser[id].length > 0));

    // Prepare profiles data for AI
    const currentUserData: ProfileData = {
      ...currentProfile,
      skills: currentSkills
    };

    // Filter out banned users and users without skills
    const candidatesData: ProfileData[] = otherProfiles
      .filter(p => !bannedUserIds.has(p.id) && usersWithSkillsSet.has(p.id))
      .map(p => ({
        ...p,
        skills: skillsByUser[p.id] || []
      }));

    // Build AI prompt
    const systemPrompt = `You are an AI matching assistant for a co-founder matching platform called Guilda. 
Your task is to analyze profile compatibility and suggest the best matches.

The platform has two archetypes:
- BUILDER: Technical people (developers, engineers)
- SELLER: Business people (marketing, sales, growth)

Complementary matches (BUILDER + SELLER) are generally preferred but same-archetype matches can also be valuable if skills complement each other.

Analyze the user's profile and rank candidates by compatibility. Consider:
1. Skill complementarity (different skills = better match)
2. Archetype compatibility (opposite archetypes often work well together)
3. Bio alignment (similar interests/goals)
4. Stats balance (if one is high in code, partner high in marketing is good)

Return ONLY a JSON array with the top 10 matches in this exact format:
[{"id": "uuid", "score": 85, "reason": "Short reason in Portuguese"}]

Score should be 0-100. Reason should be 1-2 sentences in Portuguese explaining why they're a good match.
Be creative and vary your analysis - focus on different aspects for each match.`;

    const userPrompt = `Current User Profile:
${JSON.stringify(currentUserData, null, 2)}

Candidate Profiles:
${JSON.stringify(candidatesData, null, 2)}

Analyze and return the top 10 most compatible matches as JSON array.`;

    console.log("Calling Lovable AI for profile matching...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI response:", content);

    // Parse JSON from response
    let matches = [];
    try {
      // Extract JSON array from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      matches = [];
    }

    // Enrich matches with full profile data
    const enrichedMatches = matches.map((match: any) => {
      const profile = candidatesData.find(p => p.id === match.id);
      return {
        ...match,
        profile
      };
    }).filter((m: any) => m.profile);

    return new Response(JSON.stringify({ matches: enrichedMatches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in ai-match-profiles:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});