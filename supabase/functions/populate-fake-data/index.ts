import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FakeUser {
  email: string;
  username: string;
  archetype: 'BUILDER' | 'SELLER';
  bio: string;
  avatar_seed: string;
  main_skills: string[];
  xp_level: number;
  stats: { code: number; design: number; marketing: number };
}

const fakeUsers: FakeUser[] = [
  {
    email: 'sarah.builder@fake.test',
    username: 'Sarah_Builder',
    archetype: 'BUILDER',
    bio: 'Full-stack developer with 8 years experience. Love building scalable web apps and mentoring junior devs.',
    avatar_seed: 'Sarah',
    main_skills: ['React', 'Node.js', 'PostgreSQL'],
    xp_level: 5,
    stats: { code: 85, design: 45, marketing: 30 }
  },
  {
    email: 'mike.sales@fake.test',
    username: 'Mike_Sales',
    archetype: 'SELLER',
    bio: 'Growth hacker and sales strategist. Helped 10+ startups reach their first 1000 customers.',
    avatar_seed: 'Mike',
    main_skills: ['Sales', 'Marketing', 'Growth'],
    xp_level: 4,
    stats: { code: 20, design: 50, marketing: 90 }
  },
  {
    email: 'alex.designer@fake.test',
    username: 'Alex_Designer',
    archetype: 'BUILDER',
    bio: 'UI/UX designer passionate about creating beautiful, intuitive interfaces. Figma expert.',
    avatar_seed: 'Alex',
    main_skills: ['Figma', 'UI Design', 'Prototyping'],
    xp_level: 3,
    stats: { code: 30, design: 95, marketing: 40 }
  },
  {
    email: 'emma.marketing@fake.test',
    username: 'Emma_Marketing',
    archetype: 'SELLER',
    bio: 'Content marketing specialist. Built audiences of 100K+ on multiple platforms.',
    avatar_seed: 'Emma',
    main_skills: ['Content Marketing', 'SEO', 'Social Media'],
    xp_level: 6,
    stats: { code: 15, design: 60, marketing: 95 }
  },
  {
    email: 'david.backend@fake.test',
    username: 'David_Backend',
    archetype: 'BUILDER',
    bio: 'Backend engineer specializing in microservices and cloud architecture. AWS certified.',
    avatar_seed: 'David',
    main_skills: ['Python', 'Docker', 'AWS'],
    xp_level: 7,
    stats: { code: 95, design: 25, marketing: 20 }
  },
  {
    email: 'lisa.product@fake.test',
    username: 'Lisa_Product',
    archetype: 'SELLER',
    bio: 'Product manager with a track record of successful launches. Love turning ideas into reality.',
    avatar_seed: 'Lisa',
    main_skills: ['Product Management', 'Analytics', 'Strategy'],
    xp_level: 5,
    stats: { code: 35, design: 70, marketing: 80 }
  },
  {
    email: 'james.mobile@fake.test',
    username: 'James_Mobile',
    archetype: 'BUILDER',
    bio: 'Mobile app developer (iOS & Android). Published 15+ apps with 2M+ downloads.',
    avatar_seed: 'James',
    main_skills: ['Swift', 'Kotlin', 'React Native'],
    xp_level: 6,
    stats: { code: 90, design: 55, marketing: 35 }
  },
  {
    email: 'nina.bd@fake.test',
    username: 'Nina_BD',
    archetype: 'SELLER',
    bio: 'Business development expert. Expert at partnerships and deal closing.',
    avatar_seed: 'Nina',
    main_skills: ['Business Development', 'Negotiation', 'Networking'],
    xp_level: 4,
    stats: { code: 10, design: 40, marketing: 85 }
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for secret token to prevent unauthorized use
    const { token } = await req.json().catch(() => ({ token: null }))
    const expectedToken = Deno.env.get('POPULATE_DATA_TOKEN') || 'test-populate-123'
    
    if (token !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid token. Use {"token": "test-populate-123"}' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const createdUserIds: string[] = [];

    // Create fake users
    console.log('Creating fake users...')
    for (const user of fakeUsers) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: 'FakePassword123!',
        email_confirm: true,
        user_metadata: {
          username: user.username,
          archetype: user.archetype,
          bio: user.bio
        }
      })

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError)
        continue
      }

      if (authUser.user) {
        createdUserIds.push(authUser.user.id)
        
        // Update profile with additional data
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar_seed}`,
            main_skills: user.main_skills,
            xp_level: user.xp_level,
            stats: user.stats
          })
          .eq('id', authUser.user.id)

        if (profileError) {
          console.error(`Error updating profile for ${user.email}:`, profileError)
        }
      }
    }

    // Create fake projects (marked as demo)
    console.log('Creating fake projects...')
    const projects = [
      {
        title: 'AI Recipe Generator',
        description: 'Generate personalized recipes based on ingredients you have at home using AI',
        owner_id: createdUserIds[0],
        status: 'MVP',
        is_demo: true
      },
      {
        title: 'Fitness Tracking App',
        description: 'Mobile app for tracking workouts, nutrition, and progress with social features',
        owner_id: createdUserIds[6],
        status: 'SCALE',
        is_demo: true
      },
      {
        title: 'Local Business Directory',
        description: 'Hyper-local directory connecting small businesses with their community',
        owner_id: createdUserIds[5],
        status: 'IDEA',
        is_demo: true
      },
      {
        title: 'Code Review Platform',
        description: 'Automated code review tool with AI suggestions and team collaboration',
        owner_id: createdUserIds[4],
        status: 'MVP',
        is_demo: true
      },
      {
        title: 'Sustainable Fashion Marketplace',
        description: 'Marketplace for buying/selling pre-owned designer clothes',
        owner_id: createdUserIds[3],
        status: 'SCALE',
        is_demo: true
      },
      {
        title: 'Remote Team Tools',
        description: 'Suite of tools for remote teams: standups, retros, and async collaboration',
        owner_id: createdUserIds[0],
        status: 'IDEA',
        is_demo: true
      }
    ];

    const { error: projectsError } = await supabaseAdmin
      .from('projects')
      .insert(projects)

    if (projectsError) {
      console.error('Error creating projects:', projectsError)
    }

    // Create fake matches
    console.log('Creating fake matches...')
    if (createdUserIds.length >= 8) {
      const matches = [
        { requester_id: createdUserIds[0], target_id: createdUserIds[1], status: 'ACCEPTED' },
        { requester_id: createdUserIds[2], target_id: createdUserIds[0], status: 'PENDING' },
        { requester_id: createdUserIds[4], target_id: createdUserIds[5], status: 'ACCEPTED' },
        { requester_id: createdUserIds[6], target_id: createdUserIds[7], status: 'PENDING' },
        { requester_id: createdUserIds[3], target_id: createdUserIds[6], status: 'REJECTED' },
        { requester_id: createdUserIds[5], target_id: createdUserIds[4], status: 'ACCEPTED' }
      ];

      const { error: matchesError } = await supabaseAdmin
        .from('matches')
        .insert(matches)

      if (matchesError) {
        console.error('Error creating matches:', matchesError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully created ${createdUserIds.length} fake users with projects and matches`,
        userIds: createdUserIds,
        note: '⚠️ TEST DATA - Remember to delete this later using the cleanup function'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
