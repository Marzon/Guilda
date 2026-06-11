import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFounderAnalysis, ARCHETYPE_CONFIG, TRAP_CONFIG, type FounderArchetype, type TrapType } from "./useFounderAnalysis";
import { useWarRoom } from "./useWarRoom";

interface FounderRiskData {
  userId: string;
  username: string;
  avatarUrl: string | null;
  currentDay: number;
  status: string;
  archetype: FounderArchetype | null;
  archetypeConfidence: number;
  activeTraps: Array<{
    id: string;
    trapType: TrapType;
    severity: 'info' | 'warning' | 'critical';
    createdAt: string;
    triggerData: Record<string, unknown>;
  }>;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  hoursSilent: number;
  lastActivityAt: string | null;
}

interface IntelligenceStats {
  totalFounders: number;
  criticalAlerts: number;
  warningAlerts: number;
  silenceAlerts: number;
  avgRiskScore: number;
  archetypeDistribution: Record<string, number>;
  topTraps: Array<{ type: TrapType; count: number }>;
  foundersAtRisk: number;
}

// Risk calculation weights
const RISK_WEIGHTS = {
  criticalTrap: 3.0,
  warningTrap: 1.5,
  infoTrap: 0.5,
  hoursSilent: 0.1,
  hoursSilentMax: 3.0,
  archetypeRisk: {
    FAKER: 2.0,
    CYCLOTHYMIC: 1.5,
    BUILDER_ADDICT: 1.0,
    PREMATURE_CEO: 0.5,
    UNKNOWN: 0,
  } as Record<string, number>,
  daysBehinds: 0.5,
};

function calculateRiskScore(
  traps: Array<{ severity: string }>,
  hoursSilent: number,
  archetype: FounderArchetype | null,
  currentDay: number,
  cohortDay: number
): number {
  let score = 0;

  // Trap severity
  traps.forEach(trap => {
    if (trap.severity === 'critical') score += RISK_WEIGHTS.criticalTrap;
    else if (trap.severity === 'warning') score += RISK_WEIGHTS.warningTrap;
    else score += RISK_WEIGHTS.infoTrap;
  });

  // Silence penalty
  score += Math.min(hoursSilent * RISK_WEIGHTS.hoursSilent, RISK_WEIGHTS.hoursSilentMax);

  // Archetype risk
  if (archetype) {
    score += RISK_WEIGHTS.archetypeRisk[archetype] || 0;
  }

  // Days behind
  const daysBehind = cohortDay - currentDay;
  if (daysBehind > 0) {
    score += daysBehind * RISK_WEIGHTS.daysBehinds;
  }

  return Math.min(score, 10);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 7) return 'critical';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export const useFounderIntelligence = (cohortId: string | null) => {
  const { founders, isLoading: foundersLoading } = useWarRoom(cohortId);
  const { archetypes, trapAlerts, isLoading: analysisLoading } = useFounderAnalysis(cohortId);

  // Get cohort info for calculating days behind
  const { data: cohort } = useQuery({
    queryKey: ['cohort-info', cohortId],
    queryFn: async () => {
      if (!cohortId) return null;
      const { data, error } = await supabase
        .from('cohorts')
        .select('start_date, status')
        .eq('id', cohortId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!cohortId,
  });

  // Calculate cohort day
  const cohortDay = cohort?.start_date
    ? Math.max(1, Math.ceil((Date.now() - new Date(cohort.start_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  // Build enriched founder data with risk scores
  const foundersWithRisk: FounderRiskData[] = founders.map(founder => {
    const founderArchetype = archetypes?.find(a => a.user_id === founder.user_id);
    const founderTraps = trapAlerts?.filter(t => t.user_id === founder.user_id) || [];
    
    const hoursSilent = founder.last_activity_at
      ? (Date.now() - new Date(founder.last_activity_at).getTime()) / (1000 * 60 * 60)
      : 0;

    const riskScore = calculateRiskScore(
      founderTraps.map(t => ({ severity: t.severity })),
      hoursSilent,
      founderArchetype?.archetype as FounderArchetype || null,
      founder.current_day,
      cohortDay
    );

    return {
      userId: founder.user_id,
      username: founder.profile?.username || 'Desconhecido',
      avatarUrl: founder.profile?.avatar_url || null,
      currentDay: founder.current_day,
      status: founder.status,
      archetype: (founderArchetype?.archetype as FounderArchetype) || null,
      archetypeConfidence: founderArchetype?.confidence_score || 0,
      activeTraps: founderTraps.map(t => ({
        id: t.id,
        trapType: t.trap_type as TrapType,
        severity: t.severity as 'info' | 'warning' | 'critical',
        createdAt: t.created_at,
        triggerData: t.trigger_data as Record<string, unknown>,
      })),
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      hoursSilent,
      lastActivityAt: founder.last_activity_at,
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  // Calculate aggregate stats
  const trapsData = trapAlerts || [];
  const archetypesData = archetypes || [];
  
  const stats: IntelligenceStats = {
    totalFounders: founders.length,
    criticalAlerts: trapsData.filter(t => t.severity === 'critical').length,
    warningAlerts: trapsData.filter(t => t.severity === 'warning').length,
    silenceAlerts: trapsData.filter(t => t.trap_type === 'SILENCE_ALERT').length,
    avgRiskScore: foundersWithRisk.length > 0
      ? foundersWithRisk.reduce((acc, f) => acc + f.riskScore, 0) / foundersWithRisk.length
      : 0,
    archetypeDistribution: archetypesData.reduce((acc, a) => {
      const archetype = a.archetype || 'UNKNOWN';
      acc[archetype] = (acc[archetype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    topTraps: Object.entries(
      trapsData.reduce((acc, t) => {
        acc[t.trap_type] = (acc[t.trap_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([type, count]) => ({ type: type as TrapType, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    foundersAtRisk: foundersWithRisk.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical').length,
  };

  // Add founders without archetype to distribution
  const foundersWithArchetype = archetypesData.length;
  const foundersWithoutArchetype = founders.length - foundersWithArchetype;
  if (foundersWithoutArchetype > 0) {
    stats.archetypeDistribution['UNKNOWN'] = (stats.archetypeDistribution['UNKNOWN'] || 0) + foundersWithoutArchetype;
  }

  return {
    founders: foundersWithRisk,
    stats,
    isLoading: foundersLoading || analysisLoading,
    cohortDay,
    ARCHETYPE_CONFIG,
    TRAP_CONFIG,
  };
};

export type { FounderRiskData, IntelligenceStats };
