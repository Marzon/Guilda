// Match Score calculation algorithm - local, no AI dependency

interface Stats {
  code?: number;
  design?: number;
  marketing?: number;
}

interface Skill {
  name: string;
  category: string;
  proficiency?: number;
}

interface ProfileForMatch {
  archetype: "BUILDER" | "SELLER" | "INVESTOR" | "STARTER";
  stats: Stats | null;
  skills?: Skill[];
}

/**
 * Calculate skill complementarity between two profiles
 * Different categories = better match
 */
function calculateSkillComplementarity(
  currentSkills: Skill[],
  targetSkills: Skill[]
): { score: number; reason: string } {
  if (!currentSkills.length || !targetSkills.length) {
    return { score: 0, reason: "" };
  }

  const currentCategories = new Set(currentSkills.map(s => s.category));
  const targetCategories = new Set(targetSkills.map(s => s.category));
  
  // Find complementary categories (target has what current doesn't)
  const complementaryCategories: string[] = [];
  targetCategories.forEach(cat => {
    if (!currentCategories.has(cat)) {
      complementaryCategories.push(cat);
    }
  });

  // Find overlapping categories for collaboration
  const overlappingCategories: string[] = [];
  targetCategories.forEach(cat => {
    if (currentCategories.has(cat)) {
      overlappingCategories.push(cat);
    }
  });

  // Score: complementary is worth more
  const complementaryScore = Math.min(20, complementaryCategories.length * 7);
  const overlapScore = Math.min(10, overlappingCategories.length * 3);
  
  // Generate reason
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

  return { 
    score: complementaryScore + overlapScore,
    reason
  };
}

/**
 * Generate match reason in Portuguese based on profile characteristics
 */
export function generateMatchReason(
  currentUser: ProfileForMatch,
  targetUser: ProfileForMatch
): string {
  const reasons: string[] = [];
  
  // Archetype-based reason
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
    reasons.push(`Mesmo perfil ${currentUser.archetype.toLowerCase()} - possível colaboração em projetos`);
  }

  // Stats-based reason
  const targetStats = targetUser.stats || { code: 0, design: 0, marketing: 0 };
  const highestStat = Object.entries(targetStats).reduce((a, b) => 
    (b[1] || 0) > (a[1] || 0) ? b : a
  );
  
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

  // Skills reason
  if (currentUser.skills?.length && targetUser.skills?.length) {
    const { reason } = calculateSkillComplementarity(currentUser.skills, targetUser.skills);
    if (reason) reasons.push(reason);
  }

  return reasons.slice(0, 2).join(". ") + ".";
}

/**
 * Calculate compatibility score between two profiles
 * Returns a score from 0-99 (never 100 to seem realistic)
 */
export function calculateCompatibility(
  currentUser: ProfileForMatch | null,
  targetUser: ProfileForMatch
): number {
  if (!currentUser) return 50; // Default score if no current user

  let score = 0;

  // 1. Archetype Complementarity (+40 points)
  // Builders and Sellers complement each other best
  // Investors complement both
  if (currentUser.archetype !== targetUser.archetype) {
    // Different archetypes = complementary
    if (
      (currentUser.archetype === "BUILDER" && targetUser.archetype === "SELLER") ||
      (currentUser.archetype === "SELLER" && targetUser.archetype === "BUILDER")
    ) {
      score += 40; // Builder + Seller = best match
    } else {
      score += 30; // Investor + Builder/Seller = good match
    }
  } else {
    score += 15; // Same archetype gets some base points
  }

  // 2. Stats Complementarity (+30 points max)
  // The bigger the gap in complementary skills, the better the match
  const currentStats = currentUser.stats || { code: 0, design: 0, marketing: 0 };
  const targetStats = targetUser.stats || { code: 0, design: 0, marketing: 0 };

  if (currentUser.archetype === "SELLER") {
    // Sellers need high-code Builders
    const codeBonus = Math.min(20, (targetStats.code || 0) / 5);
    // And appreciate design skills
    const designBonus = Math.min(10, (targetStats.design || 0) / 10);
    score += codeBonus + designBonus;
  } else if (currentUser.archetype === "INVESTOR") {
    // Investors appreciate balanced teams
    const codeBonus = Math.min(12, (targetStats.code || 0) / 8.33);
    const marketingBonus = Math.min(12, (targetStats.marketing || 0) / 8.33);
    const designBonus = Math.min(6, (targetStats.design || 0) / 16.67);
    score += codeBonus + marketingBonus + designBonus;
  } else {
    // Builders need high-marketing Sellers
    const marketingBonus = Math.min(20, (targetStats.marketing || 0) / 5);
    // And appreciate design skills
    const designBonus = Math.min(10, (targetStats.design || 0) / 10);
    score += marketingBonus + designBonus;
  }

  // 3. Skills Complementarity (+20 points max)
  if (currentUser.skills?.length && targetUser.skills?.length) {
    const { score: skillScore } = calculateSkillComplementarity(
      currentUser.skills,
      targetUser.skills
    );
    score += skillScore;
  }

  // 4. Activity Bonus (+10 points max)
  // Profiles with more defined stats are more active/serious
  const totalStats = (targetStats.code || 0) + (targetStats.design || 0) + (targetStats.marketing || 0);
  const activityBonus = Math.min(10, totalStats / 30);
  score += activityBonus;

  // Ensure score is between 30-99 (never too low or perfect)
  return Math.max(30, Math.min(99, Math.round(score)));
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 65) return "bg-emerald-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-orange-400";
}

/**
 * Get score label key for i18n
 */
export function getScoreLabelKey(score: number): string {
  if (score >= 80) return "tavern.matchScore.highMatch";
  if (score >= 65) return "tavern.matchScore.goodMatch";
  if (score >= 50) return "tavern.matchScore.mediumMatch";
  return "tavern.matchScore.possibleMatch";
}
