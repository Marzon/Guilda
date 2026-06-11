import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[public-stats] Fetching platform statistics...');

    // Fetch aggregated stats - no sensitive data
    const [
      { count: totalProfiles },
      { count: totalProjects },
      { count: totalMatches },
      { count: showcaseProjects }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_showcase', true)
    ]);

    // Get archetype distribution (public info)
    const { data: archetypeData } = await supabase
      .from('profiles')
      .select('archetype')
      .not('archetype', 'is', null);

    const archetypeDistribution = {
      builders: archetypeData?.filter(p => p.archetype === 'BUILDER').length || 0,
      sellers: archetypeData?.filter(p => p.archetype === 'SELLER').length || 0,
      investors: archetypeData?.filter(p => p.archetype === 'INVESTOR').length || 0,
    };

    // Get showcase projects for social proof (public info only)
    const { data: showcaseProjectsList } = await supabase
      .from('projects')
      .select('id, title')
      .eq('is_showcase', true)
      .order('created_at', { ascending: false })
      .limit(6);

    // Get open job listings (unfilled roles)
    const { data: openJobsList } = await supabase
      .from('project_roles')
      .select('id, role_name, role_description, required_archetype, required_skills, created_at, project:projects(id, title, description, cover_image_url, owner:profiles(username, avatar_url))')
      .eq('is_filled', false)
      .order('created_at', { ascending: false });

    const stats = {
      total_profiles: totalProfiles || 0,
      total_projects: totalProjects || 0,
      total_matches: totalMatches || 0,
      total_open_jobs: openJobsList?.length || 0,
      showcase_projects_count: showcaseProjects || 0,
      archetype_distribution: archetypeDistribution,
      showcase_projects: showcaseProjectsList || [],
      open_jobs: openJobsList || [],
      cached_at: new Date().toISOString(),
    };

    console.log('[public-stats] Stats fetched successfully:', {
      profiles: stats.total_profiles,
      projects: stats.total_projects,
      matches: stats.total_matches
    });

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[public-stats] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stats' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
