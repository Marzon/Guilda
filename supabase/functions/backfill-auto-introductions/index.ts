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
      console.error("[backfill] LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Auth check - require valid admin JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: isAdmin } = await supabaseClient.rpc("has_role", { role_name: "admin" });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const { dryRun = false, userIds } = body;

    console.log("[backfill] Starting backfill, dryRun:", dryRun, "userIds:", userIds);

    // 1. Fetch banned users to exclude
    const { data: bannedUsers } = await supabaseClient
      .from("banned_users")
      .select("user_id")
      .or("expires_at.is.null,expires_at.gt.now()");

    const bannedUserIds = new Set(bannedUsers?.map(b => b.user_id) || []);

    // 2. Fetch users with skills (required for matching)
    const { data: usersWithSkills } = await supabaseClient
      .from("user_skills")
      .select("user_id");

    const usersWithSkillsSet = new Set(usersWithSkills?.map(s => s.user_id) || []);

    // 3. Find users who should have received introductions but didn't
    let query = supabaseClient
      .from("profiles")
      .select("id, username, archetype, bio, avatar_url, stats, created_at")
      .not("bio", "is", null)
      .not("archetype", "is", null)
      .neq("id", ADMIN_USER_ID);

    if (userIds && userIds.length > 0) {
      query = query.in("id", userIds);
    }

    const { data: allProfilesRaw, error: profilesError } = await query;

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    // Filter out banned users and users without skills
    const allProfiles = allProfilesRaw?.filter(p => 
      !bannedUserIds.has(p.id) && usersWithSkillsSet.has(p.id)
    ) || [];

    console.log("[backfill] Total valid profiles found:", allProfiles?.length);

    // 4. Get existing introductions count per user (as introduced AND as recipient)
    // Track BOTH roles - users should not be overloaded from either side
    const { data: introsCounts } = await supabaseClient
      .from("founder_introductions")
      .select("introduced_id, recipient_id");

    const introsAsIntroducedMap: Record<string, number> = {};
    const introsAsRecipientMap: Record<string, number> = {};
    const totalIntrosMap: Record<string, number> = {}; // Total participations (both roles)
    
    introsCounts?.forEach(intro => {
      introsAsIntroducedMap[intro.introduced_id] = (introsAsIntroducedMap[intro.introduced_id] || 0) + 1;
      introsAsRecipientMap[intro.recipient_id] = (introsAsRecipientMap[intro.recipient_id] || 0) + 1;
      // Track total participations
      totalIntrosMap[intro.introduced_id] = (totalIntrosMap[intro.introduced_id] || 0) + 1;
      totalIntrosMap[intro.recipient_id] = (totalIntrosMap[intro.recipient_id] || 0) + 1;
    });

    // Maximum introductions per user (total across both roles)
    const MAX_INTROS_PER_USER = 5;
    // Maximum intros a user can receive as introduced_id
    const MAX_INTROS_AS_INTRODUCED = 3;

    // 5. Filter users who need introductions:
    // - received as introduced_id < MAX_INTROS_AS_INTRODUCED (3)
    // - total intros (both roles) < MAX_INTROS_PER_USER (5)
    const usersNeedingIntros = allProfiles?.filter(p => {
      const countAsIntroduced = introsAsIntroducedMap[p.id] || 0;
      const totalIntros = totalIntrosMap[p.id] || 0;
      return countAsIntroduced < MAX_INTROS_AS_INTRODUCED && totalIntros < MAX_INTROS_PER_USER;
    }) || [];

    console.log("[backfill] Users needing introductions:", usersNeedingIntros.length);

    const results: any[] = [];

    // 6. Process each user
    for (const targetUser of usersNeedingIntros) {
      // Re-check limits at processing time (they may have been updated during this run)
      const currentCountAsIntroduced = introsAsIntroducedMap[targetUser.id] || 0;
      const currentTotalIntros = totalIntrosMap[targetUser.id] || 0;
      
      // Skip if user already hit the global limit
      if (currentTotalIntros >= MAX_INTROS_PER_USER) {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "Already at max intros (5)" });
        continue;
      }
      
      // Calculate how many intros this user can still receive
      const roomAsIntroduced = MAX_INTROS_AS_INTRODUCED - currentCountAsIntroduced;
      const roomTotal = MAX_INTROS_PER_USER - currentTotalIntros;
      const introsNeeded = Math.min(roomAsIntroduced, roomTotal);
      
      if (introsNeeded <= 0) {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "No room for more intros" });
        continue;
      }

      console.log(`[backfill] Processing ${targetUser.username}: needs ${introsNeeded} more intros (total: ${currentTotalIntros}/${MAX_INTROS_PER_USER})`);

      // Fetch target user's skills
      const { data: targetSkills } = await supabaseClient
        .from("user_skills")
        .select(`proficiency_level, skills (name, category)`)
        .eq("user_id", targetUser.id);

      const targetSkillsData = targetSkills?.map(us => ({
        name: (us.skills as any)?.name,
        category: (us.skills as any)?.category,
        proficiency: us.proficiency_level
      })) || [];

      const targetData: ProfileData = {
        ...targetUser,
        skills: targetSkillsData
      };

      // Get existing intro partners to exclude
      const { data: existingIntros } = await supabaseClient
        .from("founder_introductions")
        .select("introduced_id, recipient_id")
        .or(`introduced_id.eq.${targetUser.id},recipient_id.eq.${targetUser.id}`);

      const existingPartners = new Set<string>();
      existingIntros?.forEach(intro => {
        if (intro.introduced_id === targetUser.id) existingPartners.add(intro.recipient_id);
        if (intro.recipient_id === targetUser.id) existingPartners.add(intro.introduced_id);
      });

      // Fetch candidates - prioritize those with fewer total intros (< MAX_INTROS_PER_USER)
      // Also exclude candidates who are already partners
      const allCandidates = allProfiles?.filter(p => 
        p.id !== targetUser.id && 
        !existingPartners.has(p.id) &&
        p.bio && p.archetype &&
        (totalIntrosMap[p.id] || 0) < MAX_INTROS_PER_USER // Don't overload anyone
      ) || [];

      // Sort by total intros (prioritize those with fewer)
      let candidateProfiles = allCandidates
        .sort((a, b) => (totalIntrosMap[a.id] || 0) - (totalIntrosMap[b.id] || 0))
        .slice(0, 40);

      if (candidateProfiles.length === 0) {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "No candidates under limit" });
        continue;
      }

      // Fetch skills for candidates
      const candidateIds = candidateProfiles.map(p => p.id);
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
      const candidatesData = candidateProfiles.map(p => ({
        ...p,
        skills: skillsByUser[p.id] || [],
        timesMatched: totalIntrosMap[p.id] || 0
      }));

      // Call AI for matching
      const systemPrompt = `Você é um assistente de matching de cofundadores.
Encontre os ${introsNeeded} melhores matches complementares para o usuário.

REGRAS:
1. BUILDER + SELLER = match ideal
2. Skills diferentes = melhor
3. Score de 50-99

PRIORIZAÇÃO DE DISTRIBUIÇÃO:
- Cada candidato tem "timesMatched" indicando quantas vezes já foi match
- PRIORIZE candidatos com menor timesMatched para distribuir networking

Retorne APENAS um array JSON:
[{"id": "uuid", "score": 85, "reason": "Razão curta"}]`;

      const userPrompt = `USUÁRIO ALVO:
${JSON.stringify(targetData, null, 2)}

CANDIDATOS (ordenados por menor timesMatched):
${JSON.stringify(candidatesData.slice(0, 25), null, 2)}

Encontre ${introsNeeded} matches complementares, priorizando menor timesMatched.`;

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
          max_tokens: 800,
        }),
      });

      if (!aiResponse.ok) {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "AI error" });
        continue;
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;

      let matches: AIMatch[] = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          matches = JSON.parse(jsonMatch[0]);
        }
      } catch {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "Parse error" });
        continue;
      }

      const validMatches = matches
        .filter(m => m.score >= 50 && candidatesData.some(c => c.id === m.id))
        .slice(0, introsNeeded);

      if (validMatches.length === 0) {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "No valid matches" });
        continue;
      }

      if (dryRun) {
        results.push({
          userId: targetUser.id,
          username: targetUser.username,
          dryRun: true,
          matchesFound: validMatches.map(m => ({
            matchId: m.id,
            matchUsername: candidatesData.find(c => c.id === m.id)?.username,
            score: m.score
          }))
        });
        continue;
      }

      // Create introductions
      const createdIntros = [];
      for (const match of validMatches) {
        const matchProfile = candidatesData.find(c => c.id === match.id);
        if (!matchProfile) continue;

        try {
          const groupName = `Apresentação: ${targetUser.username} ↔ ${matchProfile.username}`;

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

          if (groupError || !groupConversation) continue;

          const membersToInsert = [
            { conversation_id: groupConversation.id, user_id: ADMIN_USER_ID, role: "INTRODUCER" },
            { conversation_id: groupConversation.id, user_id: targetUser.id, role: "INTRODUCED" },
            { conversation_id: groupConversation.id, user_id: match.id, role: "RECIPIENT" },
          ];

          await supabaseClient.from("group_conversation_members").insert(membersToInsert);

          await supabaseClient.from("founder_introductions").insert({
            introducer_id: ADMIN_USER_ID,
            introduced_id: targetUser.id,
            recipient_id: match.id,
            group_conversation_id: groupConversation.id,
            message: match.reason,
            status: "ACTIVE",
          });

          // UPDATE COUNTERS IN REAL-TIME to prevent overloading during this execution
          introsAsIntroducedMap[targetUser.id] = (introsAsIntroducedMap[targetUser.id] || 0) + 1;
          introsAsRecipientMap[match.id] = (introsAsRecipientMap[match.id] || 0) + 1;
          totalIntrosMap[targetUser.id] = (totalIntrosMap[targetUser.id] || 0) + 1;
          totalIntrosMap[match.id] = (totalIntrosMap[match.id] || 0) + 1;

          const autoMessage = `👋 Olá! Sou o assistente da **Guilda** e identifiquei uma conexão promissora!\n\n` +
            `🎯 **${targetUser.username}** é um ${targetUser.archetype}.\n\n` +
            `🤝 **${matchProfile.username}** é um ${matchProfile.archetype} complementar.\n\n` +
            `💡 **Por que combinam:** ${match.reason}\n\n` +
            `📊 **Compatibilidade:** ${match.score}%\n\n` +
            `Aproveitem para se conhecer! 🚀`;

          await supabaseClient.from("messages").insert({
            group_conversation_id: groupConversation.id,
            sender_id: ADMIN_USER_ID,
            content: autoMessage,
          });

          // Create notifications
          const notifications = [
            {
              user_id: targetUser.id,
              type: "auto_introduction",
              title: "🎉 Encontramos cofundadores para você!",
              message: `Você foi apresentado para ${matchProfile.username} - ${match.score}% de compatibilidade!`,
              related_user_id: match.id,
            },
            {
              user_id: match.id,
              type: "auto_introduction",
              title: "🤝 Nova apresentação de founder!",
              message: `${targetUser.username} foi apresentado para você - ${match.score}% de compatibilidade!`,
              related_user_id: targetUser.id,
            },
          ];

          const { data: createdNotifs } = await supabaseClient
            .from("notifications")
            .insert(notifications)
            .select("id, user_id");

          // Send push/email
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
            } catch {}

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
            } catch {}
          }

          createdIntros.push({
            matchId: match.id,
            matchUsername: matchProfile.username,
            score: match.score
          });

        } catch (err) {
          console.error(`[backfill] Error creating intro for ${match.id}:`, err);
        }
      }

      results.push({
        userId: targetUser.id,
        username: targetUser.username,
        introsCreated: createdIntros.length,
        intros: createdIntros
      });

      // Small delay between users
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        usersProcessed: usersNeedingIntros.length,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[backfill] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
