import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email patterns used for fake users
const fakeEmailPatterns = [
  'sarah.builder@fake.test',
  'mike.sales@fake.test',
  'alex.designer@fake.test',
  'emma.marketing@fake.test',
  'david.backend@fake.test',
  'lisa.product@fake.test',
  'james.mobile@fake.test',
  'nina.bd@fake.test'
]

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

    let deletedUsers = 0
    let errors = []

    // Get all users with fake emails
    console.log('Finding fake users...')
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }

    const fakeUsers = users.users.filter(user => 
      fakeEmailPatterns.includes(user.email || '')
    )

    console.log(`Found ${fakeUsers.length} fake users to delete`)

    // Delete each fake user (this will cascade delete profiles, projects, matches due to foreign keys)
    for (const user of fakeUsers) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error(`Error deleting user ${user.email}:`, deleteError)
        errors.push({ email: user.email, error: deleteError.message })
      } else {
        deletedUsers++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup complete. Deleted ${deletedUsers} fake users and their associated data`,
        deletedUsers,
        errors: errors.length > 0 ? errors : undefined,
        note: 'All fake profiles, projects, and matches have been removed'
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
