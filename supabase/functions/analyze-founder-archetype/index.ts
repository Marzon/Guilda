import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionData {
  id: string;
  content: string;
  status: string;
  submitted_at: string;
}

interface ArchetypeScores {
  BUILDER_ADDICT: number;
  PREMATURE_CEO: number;
  FAKER: number;
  CYCLOTHYMIC: number;
}

interface ArchetypeIndicators {
  techMentions: number;
  scaleMentions: number;
  shortResponses: number;
  avgContentLength: number;
  gapVariance: number;
  rejectionRate: number;
  burstPattern: boolean;
}

// Pattern detection regexes
const TECH_PATTERNS = /\b(código|code|programar|desenvolver|implementar|configurar|API|banco|sistema|deploy|bug|feature|backend|frontend|framework|biblioteca|npm|docker|git|aws|database|sql|algoritmo|função|component|react|typescript|python|node|server)\b/gi;

const SCALE_PATTERNS = /\b(escalar|automatizar|delegar|contratar|parceiros|afiliados|rede|franquia|licenciar|investidor|investimento|série|rodada|valuation|equipe|time|terceirizar|outsource|processo|sop|playbook)\b/gi;

function countPatternMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) || []).length;
}

function calculateGapVariance(submissions: SubmissionData[]): number {
  if (submissions.length < 2) return 0;
  
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );
  
  const gaps: number[] = [];
  for (let i = 1; i < sortedSubmissions.length; i++) {
    const gap = (new Date(sortedSubmissions[i].submitted_at).getTime() - 
                 new Date(sortedSubmissions[i - 1].submitted_at).getTime()) / (1000 * 60 * 60);
    gaps.push(gap);
  }
  
  if (gaps.length === 0) return 0;
  
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((acc, gap) => acc + Math.pow(gap - mean, 2), 0) / gaps.length;
  
  return Math.sqrt(variance);
}

function detectBurstPattern(submissions: SubmissionData[]): boolean {
  if (submissions.length < 5) return false;
  
  // Look for pattern: high activity followed by silence
  const dates = submissions.map(s => new Date(s.submitted_at).toDateString());
  const submissionsPerDay = dates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dailyCounts = Object.values(submissionsPerDay);
  const hasHighDays = dailyCounts.some(c => c >= 3);
  const hasZeroDays = dailyCounts.length < 7; // Less days with submissions than expected
  
  return hasHighDays && hasZeroDays;
}

function classifyArchetype(
  submissions: SubmissionData[], 
  currentDay: number
): { archetype: string; confidence: number; indicators: ArchetypeIndicators } {
  const scores: ArchetypeScores = {
    BUILDER_ADDICT: 0,
    PREMATURE_CEO: 0,
    FAKER: 0,
    CYCLOTHYMIC: 0,
  };
  
  // Calculate indicators
  const allContent = submissions.map(s => s.content).join(' ');
  const techMentions = countPatternMatches(allContent, TECH_PATTERNS);
  const scaleMentions = countPatternMatches(allContent, SCALE_PATTERNS);
  const avgContentLength = submissions.length > 0 
    ? submissions.reduce((acc, s) => acc + s.content.length, 0) / submissions.length 
    : 0;
  const shortResponses = submissions.filter(s => s.content.length < 50).length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'REJECTED').length;
  const rejectionRate = submissions.length > 0 ? rejectedSubmissions / submissions.length : 0;
  const gapVariance = calculateGapVariance(submissions);
  const burstPattern = detectBurstPattern(submissions);
  
  const indicators: ArchetypeIndicators = {
    techMentions,
    scaleMentions,
    shortResponses,
    avgContentLength,
    gapVariance,
    rejectionRate,
    burstPattern,
  };
  
  // BUILDER_ADDICT: Heavy tech focus, few client mentions
  if (techMentions > 5) {
    scores.BUILDER_ADDICT += 2;
  }
  if (techMentions > 10) {
    scores.BUILDER_ADDICT += 2;
  }
  const clientPatterns = /\b(cliente|customer|usuário|lead|venda|contato|conversa|entrevista|feedback)\b/gi;
  const clientMentions = countPatternMatches(allContent, clientPatterns);
  if (techMentions > clientMentions * 2) {
    scores.BUILDER_ADDICT += 2;
  }
  
  // PREMATURE_CEO: Mentions scaling/automation early
  if (scaleMentions > 0 && currentDay < 10) {
    scores.PREMATURE_CEO += 3;
  }
  if (scaleMentions > 3) {
    scores.PREMATURE_CEO += 2;
  }
  
  // FAKER: Short responses, high rejection rate, late/missing submissions
  if (avgContentLength < 100) {
    scores.FAKER += 2;
  }
  if (shortResponses > submissions.length * 0.3) {
    scores.FAKER += 2;
  }
  if (rejectionRate > 0.3) {
    scores.FAKER += 3;
  }
  
  // CYCLOTHYMIC: High variance in submission patterns, burst behavior
  if (gapVariance > 24) { // More than 24h variance in gaps
    scores.CYCLOTHYMIC += 2;
  }
  if (burstPattern) {
    scores.CYCLOTHYMIC += 3;
  }
  
  // Determine winner
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore < 3) {
    return { archetype: 'UNKNOWN', confidence: 0, indicators };
  }
  
  const archetype = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'UNKNOWN';
  const confidence = Math.min(maxScore / 10, 1);
  
  return { archetype, confidence, indicators };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, cohortId } = await req.json();

    if (!userId || !cohortId) {
      return new Response(
        JSON.stringify({ error: "Missing userId or cohortId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing archetype for user ${userId} in cohort ${cohortId}`);

    // Get user's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("acceleration_submissions")
      .select("id, content, status, submitted_at")
      .eq("user_id", userId)
      .eq("cohort_id", cohortId)
      .order("submitted_at", { ascending: true });

    if (submissionsError) {
      throw submissionsError;
    }

    // Get user's current day
    const { data: progress } = await supabase
      .from("acceleration_user_progress")
      .select("current_day")
      .eq("user_id", userId)
      .eq("cohort_id", cohortId)
      .single();

    const currentDay = progress?.current_day || 1;

    // Need at least 3 submissions for meaningful analysis
    if (!submissions || submissions.length < 3) {
      console.log(`Not enough submissions (${submissions?.length || 0}) for analysis`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          archetype: 'UNKNOWN',
          confidence: 0,
          reason: 'insufficient_data'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Classify archetype
    const { archetype, confidence, indicators } = classifyArchetype(
      submissions as SubmissionData[],
      currentDay
    );

    console.log(`Classified user ${userId} as ${archetype} with confidence ${confidence}`);

    // Upsert archetype analysis
    const { error: upsertError } = await supabase
      .from("founder_archetype_analysis")
      .upsert({
        user_id: userId,
        cohort_id: cohortId,
        archetype,
        confidence_score: confidence,
        indicators,
        last_updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,cohort_id',
      });

    if (upsertError) {
      console.error("Error upserting archetype:", upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        archetype,
        confidence,
        indicators,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-founder-archetype:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
