import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_USER_ID = "38a1c53d-b99e-4958-9bb2-18663d8b9b3e";

interface ExpiredIntroduction {
  introducedUsername: string;
  recipientUsername: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[backfill-expired-introductions] Starting backfill process...");

    // 1. Get all expired introduction notifications (the ones sent to introducer with "entre")
    const { data: expiredNotifications, error: notifError } = await supabase
      .from("notifications")
      .select("message, created_at")
      .eq("type", "introduction_expired")
      .like("message", "%apresentação entre%")
      .order("created_at", { ascending: true });

    if (notifError) {
      console.error("[backfill-expired-introductions] Error fetching notifications:", notifError);
      throw notifError;
    }

    console.log(`[backfill-expired-introductions] Found ${expiredNotifications?.length || 0} expired introduction notifications`);

    if (!expiredNotifications || expiredNotifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No expired introductions found", recreated: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse usernames from messages
    // Format: "A apresentação entre @Username1 e @Username2 expirou..."
    const expiredPairs: ExpiredIntroduction[] = [];
    const regex = /@([^\s@]+)\s+e\s+@([^\s@]+)/;
    
    for (const notif of expiredNotifications) {
      const match = notif.message.match(regex);
      if (match) {
        expiredPairs.push({
          introducedUsername: match[1],
          recipientUsername: match[2],
        });
      }
    }

    console.log(`[backfill-expired-introductions] Parsed ${expiredPairs.length} pairs`);

    // 3. Get all profiles to map usernames to IDs
    const allUsernames = new Set<string>();
    expiredPairs.forEach(pair => {
      allUsernames.add(pair.introducedUsername);
      allUsernames.add(pair.recipientUsername);
    });

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, archetype, bio");

    if (profilesError) {
      console.error("[backfill-expired-introductions] Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Create case-insensitive lookup map
    const usernameToProfile: Record<string, any> = {};
    for (const profile of profiles || []) {
      usernameToProfile[profile.username.toLowerCase()] = profile;
    }

    // 4. Get admin profile for introducer
    const adminProfile = profiles?.find(p => p.id === ADMIN_USER_ID);
    if (!adminProfile) {
      throw new Error("Admin profile not found");
    }

    console.log(`[backfill-expired-introductions] Admin profile: ${adminProfile.username}`);

    // 5. Check existing introductions to avoid duplicates
    const { data: existingIntros } = await supabase
      .from("founder_introductions")
      .select("introduced_id, recipient_id");

    const existingPairs = new Set<string>();
    for (const intro of existingIntros || []) {
      existingPairs.add(`${intro.introduced_id}-${intro.recipient_id}`);
    }

    console.log(`[backfill-expired-introductions] Found ${existingPairs.size} existing introductions`);

    // 6. Recreate introductions
    let recreated = 0;
    let skipped = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    for (const pair of expiredPairs) {
      const introducedProfile = usernameToProfile[pair.introducedUsername.toLowerCase()];
      const recipientProfile = usernameToProfile[pair.recipientUsername.toLowerCase()];

      if (!introducedProfile) {
        console.log(`[backfill-expired-introductions] Profile not found: ${pair.introducedUsername}`);
        skipped++;
        continue;
      }

      if (!recipientProfile) {
        console.log(`[backfill-expired-introductions] Profile not found: ${pair.recipientUsername}`);
        skipped++;
        continue;
      }

      // Skip if introduction already exists
      const pairKey = `${introducedProfile.id}-${recipientProfile.id}`;
      if (existingPairs.has(pairKey)) {
        console.log(`[backfill-expired-introductions] Skipping existing: ${pair.introducedUsername} -> ${pair.recipientUsername}`);
        skipped++;
        continue;
      }

      // Create the introduction
      try {
        // Generate group conversation name
        const groupName = `Introdução: ${introducedProfile.username} → ${recipientProfile.username}`;

        // Create group conversation
        const { data: groupConversation, error: groupError } = await supabase
          .from("group_conversations")
          .insert({
            name: groupName,
            type: "GENERAL",
            created_by: ADMIN_USER_ID,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (groupError || !groupConversation) {
          throw new Error(`Failed to create group: ${groupError?.message}`);
        }

        // Add members
        const membersToInsert = [
          { conversation_id: groupConversation.id, user_id: ADMIN_USER_ID, role: "INTRODUCER" },
          { conversation_id: groupConversation.id, user_id: introducedProfile.id, role: "INTRODUCED" },
          { conversation_id: groupConversation.id, user_id: recipientProfile.id, role: "RECIPIENT" },
        ];

        const { error: membersError } = await supabase
          .from("group_conversation_members")
          .insert(membersToInsert);

        if (membersError) {
          await supabase.from("group_conversations").delete().eq("id", groupConversation.id);
          throw new Error(`Failed to add members: ${membersError.message}`);
        }

        // Create introduction record
        const { error: introError } = await supabase
          .from("founder_introductions")
          .insert({
            introducer_id: ADMIN_USER_ID,
            introduced_id: introducedProfile.id,
            recipient_id: recipientProfile.id,
            group_conversation_id: groupConversation.id,
            message: "Reconexão automática de apresentação expirada",
            status: "ACTIVE",
          });

        if (introError) {
          await supabase.from("group_conversations").delete().eq("id", groupConversation.id);
          throw new Error(`Failed to create introduction: ${introError.message}`);
        }

        // Insert automatic message
        const introMessage = `👋 Olá **${introducedProfile.username}** e **${recipientProfile.username}**!\n\n` +
          `Eu sou **${adminProfile.username}**, embaixador da Guilda. ` +
          `Vocês foram apresentados anteriormente e gostaria de reconectá-los!\n\n` +
          `Que tal retomar a conversa? 🚀\n\n` +
          `Abraços\n**${adminProfile.username}**`;

        await supabase.from("messages").insert({
          group_conversation_id: groupConversation.id,
          sender_id: ADMIN_USER_ID,
          content: introMessage,
        });

        // Create notifications for both users
        await supabase.from("notifications").insert([
          {
            user_id: introducedProfile.id,
            type: "founder_introduction",
            title: "Reconexão de apresentação!",
            message: `Você foi reconectado com ${recipientProfile.username}. Vamos retomar a conversa!`,
            related_user_id: ADMIN_USER_ID,
            action_url: `/messages?group=${groupConversation.id}`,
          },
          {
            user_id: recipientProfile.id,
            type: "founder_introduction",
            title: "Reconexão de apresentação!",
            message: `Você foi reconectado com ${introducedProfile.username}. Vamos retomar a conversa!`,
            related_user_id: ADMIN_USER_ID,
            action_url: `/messages?group=${groupConversation.id}`,
          },
        ]);

        // Mark pair as existing to avoid duplicates
        existingPairs.add(pairKey);
        recreated++;
        
        console.log(`[backfill-expired-introductions] Recreated: ${pair.introducedUsername} -> ${pair.recipientUsername}`);
      } catch (error: any) {
        console.error(`[backfill-expired-introductions] Error recreating ${pair.introducedUsername} -> ${pair.recipientUsername}:`, error.message);
        errorMessages.push(`${pair.introducedUsername} -> ${pair.recipientUsername}: ${error.message}`);
        errors++;
      }
    }

    console.log(`[backfill-expired-introductions] Complete. Recreated: ${recreated}, Skipped: ${skipped}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        total: expiredPairs.length,
        recreated,
        skipped,
        errors,
        errorMessages: errorMessages.slice(0, 10), // First 10 errors
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[backfill-expired-introductions] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
