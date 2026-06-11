import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails, token } = await req.json();

    // Validate security token
    const expectedToken = Deno.env.get("POPULATE_DATA_TOKEN") || "guilda-dev-2024";
    if (token !== expectedToken) {
      console.error("Invalid token provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "emails array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting deletion of ${emails.length} test users:`, emails);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Get ALL users with pagination (default limit is 50)
    console.log("Fetching all users with pagination...");
    const allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      console.log(`Fetching page ${page}...`);
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });

      if (listError) {
        console.error("Error listing users:", listError);
        return new Response(
          JSON.stringify({ error: "Failed to list users", details: listError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data?.users?.length) {
        console.log(`Page ${page} is empty, stopping pagination`);
        break;
      }

      allUsers.push(...data.users);
      console.log(`Page ${page}: Found ${data.users.length} users (total so far: ${allUsers.length})`);
      
      if (data.users.length < perPage) {
        console.log("Last page reached");
        break;
      }
      
      page++;
    }

    console.log(`Total users in system: ${allUsers.length}`);

    // Find users matching the provided emails
    const usersToDelete = allUsers.filter(user => 
      user.email && emails.includes(user.email)
    );

    console.log(`Found ${usersToDelete.length} users to delete out of ${emails.length} requested`);
    console.log("Users to delete:", usersToDelete.map(u => u.email));

    // Delete each user
    for (const user of usersToDelete) {
      try {
        console.log(`Deleting user: ${user.email} (${user.id})`);
        
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`Error deleting ${user.email}:`, deleteError);
          results.push({ email: user.email!, success: false, error: deleteError.message });
        } else {
          console.log(`Successfully deleted: ${user.email}`);
          results.push({ email: user.email!, success: true });
        }
      } catch (err) {
        console.error(`Exception deleting ${user.email}:`, err);
        results.push({ email: user.email!, success: false, error: String(err) });
      }
    }

    // Check for emails that weren't found
    const foundEmails = usersToDelete.map(u => u.email);
    const notFoundEmails = emails.filter(email => !foundEmails.includes(email));
    
    for (const email of notFoundEmails) {
      results.push({ email, success: false, error: "User not found" });
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Deletion complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        message: `Deleted ${successCount} users, ${failCount} failed`,
        results,
        summary: {
          total: emails.length,
          deleted: successCount,
          failed: failCount,
          notFound: notFoundEmails.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
