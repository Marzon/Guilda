import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Stats {
  code?: number;
  design?: number;
  marketing?: number;
}

interface Skill {
  name: string;
  category: string;
  proficiency: number;
}

interface ProfileData {
  id: string;
  username: string;
  archetype: string;
  bio: string | null;
  stats: Stats | null;
  skills: Skill[];
  avatar_url?: string | null;
}

// Calculate skill complementarity
function calculateSkillComplementarity(
  currentSkills: Skill[],
  targetSkills: Skill[]
): { score: number; reason: string } {
  if (!currentSkills.length || !targetSkills.length) {
    return { score: 0, reason: "" };
  }

  const currentCategories = new Set(currentSkills.map(s => s.category));
  const targetCategories = new Set(targetSkills.map(s => s.category));
  
  const complementaryCategories: string[] = [];
  targetCategories.forEach(cat => {
    if (!currentCategories.has(cat)) {
      complementaryCategories.push(cat);
    }
  });

  const overlappingCategories: string[] = [];
  targetCategories.forEach(cat => {
    if (currentCategories.has(cat)) {
      overlappingCategories.push(cat);
    }
  });

  const complementaryScore = Math.min(20, complementaryCategories.length * 7);
  const overlapScore = Math.min(10, overlappingCategories.length * 3);
  
  let reason = "";
  const targetTopSkills = targetSkills.slice(0, 3).map(s => s.name);
  
  if (complementaryCategories.length > 0) {
    const categoryLabels: Record<string, string> = {
      tech: "habilidades técnicas",
      design: "habilidades de design", 
      business: "habilidades de negócios",
      investor: "experiência em investimentos"
    };
    const compLabel = complementaryCategories.map(c => categoryLabels[c] || c).join(" e ");
    reason = `Complementa com ${compLabel}`;
  } else if (overlappingCategories.length > 0) {
    reason = `Skills em comum: ${targetTopSkills.join(", ")}`;
  }

  return { score: complementaryScore + overlapScore, reason };
}

// Generate match reason
function generateMatchReason(
  currentUser: ProfileData,
  targetUser: ProfileData
): string {
  const reasons: string[] = [];
  
  if (currentUser.archetype === "BUILDER" && targetUser.archetype === "SELLER") {
    reasons.push("Builder + Seller = parceria técnica e comercial ideal");
  } else if (currentUser.archetype === "SELLER" && targetUser.archetype === "BUILDER") {
    reasons.push("Seller + Builder = você traz o mercado, ele constrói o produto");
  } else if (targetUser.archetype === "INVESTOR") {
    reasons.push("Investidor pode agregar capital e network");
  } else if (currentUser.archetype === "INVESTOR") {
    if (targetUser.archetype === "BUILDER") {
      reasons.push("Builder com potencial para construir produtos escaláveis");
    } else {
      reasons.push("Seller com visão de mercado e crescimento");
    }
  } else if (currentUser.archetype === targetUser.archetype) {
    reasons.push(`Mesmo perfil ${currentUser.archetype.toLowerCase()} - possível colaboração`);
  }

  const targetStats = targetUser.stats || { code: 0, design: 0, marketing: 0 };
  const entries = Object.entries(targetStats) as [string, number][];
  const highestStat = entries.reduce((a, b) => (b[1] || 0) > (a[1] || 0) ? b : a);
  
  if ((highestStat[1] || 0) >= 70) {
    const statLabels: Record<string, string> = {
      code: "Forte em código",
      design: "Forte em design",
      marketing: "Forte em marketing"
    };
    if (statLabels[highestStat[0]]) {
      reasons.push(statLabels[highestStat[0]]);
    }
  }

  if (currentUser.skills?.length && targetUser.skills?.length) {
    const { reason } = calculateSkillComplementarity(currentUser.skills, targetUser.skills);
    if (reason) reasons.push(reason);
  }

  return reasons.slice(0, 2).join(". ") + ".";
}

// Calculate compatibility score
function calculateCompatibility(
  currentUser: ProfileData,
  targetUser: ProfileData
): number {
  let score = 0;

  // Archetype Complementarity (+40 points)
  if (currentUser.archetype !== targetUser.archetype) {
    if (
      (currentUser.archetype === "BUILDER" && targetUser.archetype === "SELLER") ||
      (currentUser.archetype === "SELLER" && targetUser.archetype === "BUILDER")
    ) {
      score += 40;
    } else {
      score += 30;
    }
  } else {
    score += 15;
  }

  // Stats Complementarity (+30 points max)
  const targetStats = targetUser.stats || { code: 0, design: 0, marketing: 0 };

  if (currentUser.archetype === "SELLER") {
    const codeBonus = Math.min(20, (targetStats.code || 0) / 5);
    const designBonus = Math.min(10, (targetStats.design || 0) / 10);
    score += codeBonus + designBonus;
  } else if (currentUser.archetype === "INVESTOR") {
    const codeBonus = Math.min(12, (targetStats.code || 0) / 8.33);
    const marketingBonus = Math.min(12, (targetStats.marketing || 0) / 8.33);
    const designBonus = Math.min(6, (targetStats.design || 0) / 16.67);
    score += codeBonus + marketingBonus + designBonus;
  } else {
    const marketingBonus = Math.min(20, (targetStats.marketing || 0) / 5);
    const designBonus = Math.min(10, (targetStats.design || 0) / 10);
    score += marketingBonus + designBonus;
  }

  // Skills Complementarity (+20 points max)
  if (currentUser.skills?.length && targetUser.skills?.length) {
    const { score: skillScore } = calculateSkillComplementarity(
      currentUser.skills,
      targetUser.skills
    );
    score += skillScore;
  }

  // Activity Bonus (+10 points max)
  const totalStats = (targetStats.code || 0) + (targetStats.design || 0) + (targetStats.marketing || 0);
  const activityBonus = Math.min(10, totalStats / 30);
  score += activityBonus;

  return Math.max(30, Math.min(99, Math.round(score)));
}

// Generate a daily seed for consistent-within-day but varying-between-days randomness
function getDailySeed(userId: string): number {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const seedStr = `${userId}-${today}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator for reproducible randomness
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, excludeIds = [] } = await req.json();
    if (!userId) {
      throw new Error("userId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current user's profile
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
      .select(`proficiency_level, skills (name, category)`)
      .eq("user_id", userId);

    const currentSkills: Skill[] = currentUserSkills?.map(us => ({
      name: (us.skills as any)?.name,
      category: (us.skills as any)?.category,
      proficiency: us.proficiency_level
    })) || [];

    // Determine complementary archetype (BUILDER sees SELLERs, SELLER sees BUILDERs)
    // INVESTORs should not use this endpoint (they use Capital page)
    let complementaryArchetype: string | null = null;
    if (currentProfile.archetype === "BUILDER") {
      complementaryArchetype = "SELLER";
    } else if (currentProfile.archetype === "SELLER") {
      complementaryArchetype = "BUILDER";
    }

    // Fetch other profiles (excluding current user, filtered by complementary archetype)
    let query = supabase
      .from("profiles")
      .select("id, username, archetype, bio, stats, avatar_url")
      .neq("id", userId);
    
    // Only show complementary archetype if user is BUILDER or SELLER
    if (complementaryArchetype) {
      query = query.eq("archetype", complementaryArchetype);
    }
    
    const { data: otherProfiles, error: othersError } = await query.limit(100);

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
      .select(`user_id, proficiency_level, skills (name, category)`)
      .in("user_id", otherUserIds);

    // Group skills by user
    const skillsByUser: Record<string, Skill[]> = {};
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

    // Build profile data
    const currentUserData: ProfileData = {
      ...currentProfile,
      skills: currentSkills
    };

    // Create set of excluded IDs (already connected/seen)
    const excludeSet = new Set(excludeIds as string[]);

    // Filter out banned users, users without skills, and excluded users
    const candidatesData: ProfileData[] = otherProfiles
      .filter(p => !bannedUserIds.has(p.id) && usersWithSkillsSet.has(p.id) && !excludeSet.has(p.id))
      .map(p => ({
        ...p,
        skills: skillsByUser[p.id] || []
      }));

    // Get daily seed for consistent-but-varying randomness
    const dailySeed = getDailySeed(userId);

    // Calculate scores with randomness factor for variety
    const scoredMatches = candidatesData.map((candidate, index) => {
      const baseScore = calculateCompatibility(currentUserData, candidate);
      
      // Add ±15% randomness to the score (seeded by day + user + candidate)
      const randomFactor = seededRandom(dailySeed, index);
      const variance = (randomFactor - 0.5) * 0.3; // -15% to +15%
      const adjustedScore = Math.round(baseScore * (1 + variance));
      
      return {
        id: candidate.id,
        score: Math.max(30, Math.min(99, adjustedScore)),
        reason: generateMatchReason(currentUserData, candidate),
        profile: candidate
      };
    });

    // Sort by adjusted score and take top 10
    scoredMatches.sort((a, b) => b.score - a.score);
    const topMatches = scoredMatches.slice(0, 10);

    console.log(`Algorithmic matching completed: ${topMatches.length} matches for user ${userId}`);

    return new Response(JSON.stringify({ matches: topMatches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in algorithmic-match-profiles:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
