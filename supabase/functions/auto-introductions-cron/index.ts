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
      console.error("[auto-introductions-cron] LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Auth check - require service role key OR cron secret for cron jobs
    const authHeader = req.headers.get("Authorization");
    const cronSecret = req.headers.get("x-cron-secret");
    
    // Accept cron secret for scheduled jobs
    if (cronSecret === "guilda-auto-intro-2024") {
      console.log("[auto-introductions-cron] Authenticated via cron secret");
    } else if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      const token = authHeader.replace("Bearer ", "");
      
      // For cron jobs, accept service role key directly
      if (token !== supabaseServiceKey) {
        // Try validating as admin user JWT
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
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
      }
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    let body: { maxUsers?: number; daysBack?: number } = {};
    try {
      body = await req.json();
    } catch {
      // Default values if no body provided
    }

    const maxUsers = body.maxUsers || 50;
    const daysBack = body.daysBack || 7;

    console.log(`[auto-introductions-cron] Starting cron job, maxUsers: ${maxUsers}, daysBack: ${daysBack}`);

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

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

    // 3. Get existing introductions count per user
    const { data: introsCounts } = await supabaseClient
      .from("founder_introductions")
      .select("introduced_id, recipient_id");

    const introsAsIntroducedMap: Record<string, number> = {};
    const totalIntrosMap: Record<string, number> = {};
    
    introsCounts?.forEach(intro => {
      introsAsIntroducedMap[intro.introduced_id] = (introsAsIntroducedMap[intro.introduced_id] || 0) + 1;
      totalIntrosMap[intro.introduced_id] = (totalIntrosMap[intro.introduced_id] || 0) + 1;
      totalIntrosMap[intro.recipient_id] = (totalIntrosMap[intro.recipient_id] || 0) + 1;
    });

    const MAX_INTROS_PER_USER = 5;
    const MAX_INTROS_AS_INTRODUCED = 3;

    // 4. Find recent users who need introductions
    const { data: recentProfiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("id, username, archetype, bio, avatar_url, stats, created_at")
      .not("bio", "is", null)
      .not("archetype", "is", null)
      .neq("id", ADMIN_USER_ID)
      .gte("created_at", dateThreshold.toISOString())
      .order("created_at", { ascending: false })
      .limit(maxUsers * 2); // Fetch extra to account for filtering

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    // Filter eligible users
    const eligibleProfiles = recentProfiles?.filter(p => 
      !bannedUserIds.has(p.id) && 
      usersWithSkillsSet.has(p.id) &&
      (introsAsIntroducedMap[p.id] || 0) < MAX_INTROS_AS_INTRODUCED &&
      (totalIntrosMap[p.id] || 0) < MAX_INTROS_PER_USER
    ).slice(0, maxUsers) || [];

    console.log(`[auto-introductions-cron] Eligible users to process: ${eligibleProfiles.length}`);

    if (eligibleProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users need introductions",
          usersProcessed: 0,
          introductionsCreated: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 5. Fetch all profiles for candidate matching
    const { data: allProfilesRaw } = await supabaseClient
      .from("profiles")
      .select("id, username, archetype, bio, avatar_url, stats")
      .not("bio", "is", null)
      .not("archetype", "is", null)
      .neq("id", ADMIN_USER_ID);

    const allProfiles = allProfilesRaw?.filter(p => 
      !bannedUserIds.has(p.id) && usersWithSkillsSet.has(p.id)
    ) || [];

    const results: any[] = [];
    let totalIntroductionsCreated = 0;

    // 6. Process each eligible user
    for (const targetUser of eligibleProfiles) {
      const currentCountAsIntroduced = introsAsIntroducedMap[targetUser.id] || 0;
      const currentTotalIntros = totalIntrosMap[targetUser.id] || 0;
      
      if (currentTotalIntros >= MAX_INTROS_PER_USER) {
        continue;
      }
      
      const roomAsIntroduced = MAX_INTROS_AS_INTRODUCED - currentCountAsIntroduced;
      const roomTotal = MAX_INTROS_PER_USER - currentTotalIntros;
      const introsNeeded = Math.min(roomAsIntroduced, roomTotal);
      
      if (introsNeeded <= 0) {
        continue;
      }

      console.log(`[auto-introductions-cron] Processing ${targetUser.username}: needs ${introsNeeded} intros`);

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

      // Get existing intro partners
      const { data: existingIntros } = await supabaseClient
        .from("founder_introductions")
        .select("introduced_id, recipient_id")
        .or(`introduced_id.eq.${targetUser.id},recipient_id.eq.${targetUser.id}`);

      const existingPartners = new Set<string>();
      existingIntros?.forEach(intro => {
        if (intro.introduced_id === targetUser.id) existingPartners.add(intro.recipient_id);
        if (intro.recipient_id === targetUser.id) existingPartners.add(intro.introduced_id);
      });

      // Get candidates
      const allCandidates = allProfiles?.filter(p => 
        p.id !== targetUser.id && 
        !existingPartners.has(p.id) &&
        (totalIntrosMap[p.id] || 0) < MAX_INTROS_PER_USER
      ) || [];

      let candidateProfiles = allCandidates
        .sort((a, b) => (totalIntrosMap[a.id] || 0) - (totalIntrosMap[b.id] || 0))
        .slice(0, 40);

      if (candidateProfiles.length === 0) {
        results.push({ userId: targetUser.id, username: targetUser.username, skipped: true, reason: "No candidates" });
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

          // Update counters
          introsAsIntroducedMap[targetUser.id] = (introsAsIntroducedMap[targetUser.id] || 0) + 1;
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

          // Send push/email notifications
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
          totalIntroductionsCreated++;

        } catch (err) {
          console.error(`[auto-introductions-cron] Error creating intro for ${match.id}:`, err);
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

    console.log(`[auto-introductions-cron] Completed. Users processed: ${results.length}, Introductions created: ${totalIntroductionsCreated}`);

    return new Response(
      JSON.stringify({
        success: true,
        usersProcessed: results.length,
        introductionsCreated: totalIntroductionsCreated,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[auto-introductions-cron] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
