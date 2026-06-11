import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin user ID that will act as the automated introducer (Guilda Bot)
const ADMIN_USER_ID = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';

interface ProfileData {
  id: string;
  username: string;
  archetype: string;
  bio: string | null;
  avatar_url: string | null;
  stats: { code?: number; design?: number; marketing?: number } | null;
  skills: { name: string; category: string; proficiency: number }[];
}

interface AIMatch {
  id: string;
  score: number;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("[auto-introduce] LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Auth check - require valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[auto-introduce] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate user JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.log("[auto-introduce] Invalid user token:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const newUserId = user.id;
    console.log("[auto-introduce] Starting auto-introduction for user:", newUserId);

    // 1. Fetch the new user's profile with skills
    const { data: newUserProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, username, archetype, bio, avatar_url, stats")
      .eq("id", newUserId)
      .single();

    if (profileError || !newUserProfile) {
      console.error("[auto-introduce] Failed to fetch new user profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    // Check if profile is complete enough
    if (!newUserProfile.archetype || !newUserProfile.bio) {
      console.log("[auto-introduce] User profile incomplete, skipping auto-introduction");
      return new Response(
        JSON.stringify({ success: false, reason: "Profile incomplete" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Skip auto-introductions for investors - they don't participate in co-founder matching
    if (newUserProfile.archetype === "INVESTOR") {
      console.log("[auto-introduce] Skipping auto-introduction for investor profile");
      return new Response(
        JSON.stringify({ success: false, reason: "Investors do not receive auto-introductions" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch new user's skills
    const { data: newUserSkills } = await supabaseClient
      .from("user_skills")
      .select(`proficiency_level, skills (name, category)`)
      .eq("user_id", newUserId);

    const currentSkills = newUserSkills?.map(us => ({
      name: (us.skills as any)?.name,
      category: (us.skills as any)?.category,
      proficiency: us.proficiency_level
    })) || [];

    const newUserData: ProfileData = {
      ...newUserProfile,
      skills: currentSkills
    };

    console.log("[auto-introduce] New user data:", { username: newUserProfile.username, archetype: newUserProfile.archetype });

    // 2. Check for existing introductions to avoid duplicates
    const { data: existingIntros } = await supabaseClient
      .from("founder_introductions")
      .select("introduced_id, recipient_id")
      .or(`introduced_id.eq.${newUserId},recipient_id.eq.${newUserId}`);

    const existingPartners = new Set<string>();
    existingIntros?.forEach(intro => {
      if (intro.introduced_id === newUserId) existingPartners.add(intro.recipient_id);
      if (intro.recipient_id === newUserId) existingPartners.add(intro.introduced_id);
    });

    console.log("[auto-introduce] Existing intro partners:", existingPartners.size);

    // 3. Get TOTAL introduction counts per user (both as introduced AND recipient)
    // This prevents overloading any single user with too many introductions
    const { data: allIntrosCounts } = await supabaseClient
      .from("founder_introductions")
      .select("introduced_id, recipient_id");

    const totalIntrosMap: Record<string, number> = {};
    allIntrosCounts?.forEach(intro => {
      totalIntrosMap[intro.introduced_id] = (totalIntrosMap[intro.introduced_id] || 0) + 1;
      totalIntrosMap[intro.recipient_id] = (totalIntrosMap[intro.recipient_id] || 0) + 1;
    });

    // Maximum introductions per user (total across both roles)
    const MAX_INTROS_PER_USER = 5;
    
    // Check if the NEW USER already has too many intros (they may have been processed by backfill)
    const newUserTotalIntros = totalIntrosMap[newUserId] || 0;
    if (newUserTotalIntros >= MAX_INTROS_PER_USER) {
      console.log(`[auto-introduce] New user already has ${newUserTotalIntros} intros, skipping`);
      return new Response(
        JSON.stringify({ success: false, reason: `User already has ${newUserTotalIntros} introductions (max: ${MAX_INTROS_PER_USER})` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Calculate how many more intros this new user can receive
    const introsRoomForNewUser = MAX_INTROS_PER_USER - newUserTotalIntros;

    // 4. Fetch banned users to exclude
    const { data: bannedUsers } = await supabaseClient
      .from("banned_users")
      .select("user_id")
      .or("expires_at.is.null,expires_at.gt.now()");

    const bannedUserIds = new Set(bannedUsers?.map(b => b.user_id) || []);

    // 5. Fetch users with skills (required for matching)
    const { data: usersWithSkills } = await supabaseClient
      .from("user_skills")
      .select("user_id");

    const usersWithSkillsIds = [...new Set(usersWithSkills?.map(s => s.user_id) || [])];

    // 6. Fetch candidate profiles (excluding new user, admin, investors, and users without skills)
    const { data: candidateProfiles, error: candidatesError } = await supabaseClient
      .from("profiles")
      .select("id, username, archetype, bio, avatar_url, stats")
      .neq("id", newUserId)
      .neq("id", ADMIN_USER_ID)
      .neq("archetype", "INVESTOR")
      .not("bio", "is", null)
      .not("archetype", "is", null)
      .in("id", usersWithSkillsIds.length > 0 ? usersWithSkillsIds : ['none'])
      .limit(50);

    if (candidatesError || !candidateProfiles?.length) {
      console.log("[auto-introduce] No candidate profiles found");
      return new Response(
        JSON.stringify({ success: false, reason: "No candidates available" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter out banned users
    const filteredCandidates = candidateProfiles.filter(p => !bannedUserIds.has(p.id));

    if (filteredCandidates.length === 0) {
      console.log("[auto-introduce] No valid candidates after filtering banned users");
      return new Response(
        JSON.stringify({ success: false, reason: "No candidates available" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter out users who already have introductions with new user
    // AND prioritize those who have been matched fewer times (< MAX_INTROS_PER_USER)
    let availableCandidates = filteredCandidates
      .filter(p => !existingPartners.has(p.id) && (totalIntrosMap[p.id] || 0) < MAX_INTROS_PER_USER);

    // Fallback: if all candidates have >= MAX matches, use all candidates sorted by fewest matches
    if (availableCandidates.length === 0) {
      console.log("[auto-introduce] All candidates have 5+ matches, using fallback");
      availableCandidates = filteredCandidates
        .filter(p => !existingPartners.has(p.id))
        .sort((a, b) => (totalIntrosMap[a.id] || 0) - (totalIntrosMap[b.id] || 0));
    }

    if (availableCandidates.length === 0) {
      console.log("[auto-introduce] All candidates already have introductions");
      return new Response(
        JSON.stringify({ success: false, reason: "No new candidates available" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[auto-introduce] Available candidates:", availableCandidates.length);

    // Fetch skills for all candidates
    const candidateIds = availableCandidates.map(p => p.id);
    const { data: allCandidateSkills } = await supabaseClient
      .from("user_skills")
      .select(`user_id, proficiency_level, skills (name, category)`)
      .in("user_id", candidateIds);

    const skillsByUser: Record<string, { name: string; category: string; proficiency: number }[]> = {};
    allCandidateSkills?.forEach(us => {
      if (!skillsByUser[us.user_id]) skillsByUser[us.user_id] = [];
      skillsByUser[us.user_id].push({
        name: (us.skills as any)?.name,
        category: (us.skills as any)?.category,
        proficiency: us.proficiency_level
      });
    });

    // Include timesMatched in candidate data for AI prioritization
    const candidatesData = availableCandidates.map(p => ({
      ...p,
      skills: skillsByUser[p.id] || [],
      timesMatched: totalIntrosMap[p.id] || 0
    }));

    // 5. Call AI to find best matches
    const systemPrompt = `Você é um assistente de matching de cofundadores da plataforma Guilda.
Sua tarefa é analisar o perfil de um novo usuário e encontrar os 3 melhores matches complementares.

Arquétipos:
- BUILDER: Pessoas técnicas (devs, engenheiros, designers de produto)
- SELLER: Pessoas de negócios (marketing, vendas, growth)
- INVESTOR: Investidores procurando startups

REGRAS DE COMPLEMENTARIDADE:
1. BUILDER + SELLER = match ideal (arquétipos opostos se complementam)
2. Skills diferentes = melhor match (um bom em código, outro em marketing)
3. Bio com objetivos alinhados = bonus
4. Evite matches do mesmo arquétipo a menos que skills sejam muito complementares

PRIORIZAÇÃO DE DISTRIBUIÇÃO:
- Cada candidato tem um campo "timesMatched" indicando quantas vezes já foi usado como match
- PRIORIZE candidatos com menor "timesMatched" para distribuir o networking de forma equilibrada
- Candidatos com timesMatched = 0 são novos e devem ter prioridade máxima

Retorne APENAS um array JSON com exatamente 3 matches no formato:
[{"id": "uuid", "score": 85, "reason": "Razão em português explicando a complementaridade"}]

Score de 50-99. Reason deve ter 1-2 frases curtas explicando POR QUE são complementares.`;

    const userPrompt = `NOVO USUÁRIO (quem acabou de se cadastrar):
${JSON.stringify(newUserData, null, 2)}

CANDIDATOS DISPONÍVEIS (ordenados por menor timesMatched):
${JSON.stringify(candidatesData.slice(0, 25), null, 2)}

Encontre os 3 melhores cofundadores complementares. Priorize arquétipos opostos, skills diferentes, e candidatos com menor timesMatched.`;

    console.log("[auto-introduce] Calling Lovable AI for matching...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[auto-introduce] AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429 || aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, reason: "AI service temporarily unavailable" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    console.log("[auto-introduce] AI response:", content);

    // Parse AI response
    let matches: AIMatch[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("[auto-introduce] Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ success: false, reason: "Failed to parse AI matches" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter matches with score >= 50 and limit based on room available
    const maxMatchesToCreate = Math.min(3, introsRoomForNewUser);
    const validMatches = matches
      .filter(m => m.score >= 50 && candidatesData.some(c => c.id === m.id))
      .slice(0, maxMatchesToCreate);

    if (validMatches.length === 0) {
      console.log("[auto-introduce] No valid matches found");
      return new Response(
        JSON.stringify({ success: false, reason: "No suitable matches found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[auto-introduce] Valid matches:", validMatches.length);

    // 5. Get admin profile for introducing
    const { data: adminProfile } = await supabaseClient
      .from("profiles")
      .select("id, username")
      .eq("id", ADMIN_USER_ID)
      .single();

    if (!adminProfile) {
      console.error("[auto-introduce] Admin profile not found");
      throw new Error("Admin profile not found");
    }

    // 6. Create introductions for each match
    const createdIntroductions = [];

    for (const match of validMatches) {
      const matchProfile = candidatesData.find(c => c.id === match.id);
      if (!matchProfile) continue;

      console.log("[auto-introduce] Creating introduction:", { 
        newUser: newUserProfile.username, 
        match: matchProfile.username,
        score: match.score 
      });

      try {
        // Generate group name
        const groupName = `Apresentação: ${newUserProfile.username} ↔ ${matchProfile.username}`;

        // Create group conversation
        const { data: groupConversation, error: groupError } = await supabaseClient
          .from("group_conversations")
          .insert({
            name: groupName,
            type: "INTRODUCTION",
            created_by: ADMIN_USER_ID,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (groupError || !groupConversation) {
          console.error("[auto-introduce] Failed to create group:", groupError);
          continue;
        }

        // Add members
        const membersToInsert = [
          { conversation_id: groupConversation.id, user_id: ADMIN_USER_ID, role: "INTRODUCER" },
          { conversation_id: groupConversation.id, user_id: newUserId, role: "INTRODUCED" },
          { conversation_id: groupConversation.id, user_id: match.id, role: "RECIPIENT" },
        ];

        const { error: membersError } = await supabaseClient
          .from("group_conversation_members")
          .insert(membersToInsert);

        if (membersError) {
          console.error("[auto-introduce] Failed to add members:", membersError);
          await supabaseClient.from("group_conversations").delete().eq("id", groupConversation.id);
          continue;
        }

        // Create founder_introduction record
        const { data: introduction, error: introError } = await supabaseClient
          .from("founder_introductions")
          .insert({
            introducer_id: ADMIN_USER_ID,
            introduced_id: newUserId,
            recipient_id: match.id,
            group_conversation_id: groupConversation.id,
            message: match.reason,
            status: "ACTIVE",
          })
          .select()
          .single();

        if (introError) {
          console.error("[auto-introduce] Failed to create introduction:", introError);
          await supabaseClient.from("group_conversations").delete().eq("id", groupConversation.id);
          continue;
        }

        // Generate auto message
        const autoMessage = `👋 Olá! Sou o assistente da **Guilda** e identifiquei uma conexão promissora entre vocês!\n\n` +
          `🎯 **${newUserProfile.username}** é um ${newUserProfile.archetype} que acabou de entrar na plataforma.\n\n` +
          `🤝 **${matchProfile.username}** é um ${matchProfile.archetype} com um perfil super complementar.\n\n` +
          `💡 **Por que vocês combinam:** ${match.reason}\n\n` +
          `📊 **Compatibilidade:** ${match.score}%\n\n` +
          `Aproveitem para se conhecer e explorar possíveis parcerias! 🚀`;

        await supabaseClient
          .from("messages")
          .insert({
            group_conversation_id: groupConversation.id,
            sender_id: ADMIN_USER_ID,
            content: autoMessage,
          });

        // Create notifications
        const notifications = [
          {
            user_id: newUserId,
            type: "auto_introduction",
            title: "🎉 Encontramos cofundadores para você!",
            message: `Você foi apresentado para ${matchProfile.username} - ${match.score}% de compatibilidade!`,
            related_user_id: match.id,
          },
          {
            user_id: match.id,
            type: "auto_introduction",
            title: "🤝 Nova apresentação de founder!",
            message: `${newUserProfile.username} acabou de entrar na Guilda e vocês têm ${match.score}% de compatibilidade!`,
            related_user_id: newUserId,
          },
        ];

        const { data: createdNotifs } = await supabaseClient
          .from("notifications")
          .insert(notifications)
          .select("id, user_id");

        // Send push notifications
        for (const notif of notifications) {
          const notifId = createdNotifs?.find(n => n.user_id === notif.user_id)?.id;
          try {
            await supabaseClient.functions.invoke("send-push-notification", {
              body: {
                userId: notif.user_id,
                title: notif.title,
                body: notif.message,
                type: "auto_introduction",
                url: "/messages",
                notificationId: notifId,
              },
            });
          } catch (pushErr) {
            console.error("[auto-introduce] Push error:", pushErr);
          }
        }

        // Send email notifications
        for (const notif of notifications) {
          const notifId = createdNotifs?.find(n => n.user_id === notif.user_id)?.id;
          try {
            await supabaseClient.functions.invoke("send-notification-email", {
              body: {
                userId: notif.user_id,
                type: "auto_introduction",
                title: notif.title,
                message: notif.message,
                notificationId: notifId,
              },
            });
          } catch (emailErr) {
            console.error("[auto-introduce] Email error:", emailErr);
          }
        }

        // UPDATE COUNTERS IN REAL-TIME to prevent overloading during this execution
        totalIntrosMap[newUserId] = (totalIntrosMap[newUserId] || 0) + 1;
        totalIntrosMap[match.id] = (totalIntrosMap[match.id] || 0) + 1;

        createdIntroductions.push({
          introductionId: introduction.id,
          matchId: match.id,
          matchUsername: matchProfile.username,
          score: match.score,
        });

        console.log("[auto-introduce] Successfully created introduction for:", matchProfile.username, `(new user now has ${totalIntrosMap[newUserId]} intros)`);

      } catch (introErr) {
        console.error("[auto-introduce] Error creating introduction for", match.id, ":", introErr);
        continue;
      }
    }

    console.log("[auto-introduce] Total introductions created:", createdIntroductions.length);

    return new Response(
      JSON.stringify({
        success: true,
        introductionsCreated: createdIntroductions.length,
        introductions: createdIntroductions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("[auto-introduce] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
