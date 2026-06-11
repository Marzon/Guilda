// deno-lint-ignore-file no-explicit-any

/**
 * Central admin user ID - single source of truth for edge functions
 * This is the real admin user (rob.delfiol@gmail.com / ShadowBerserkerWalker)
 * 
 * Keep in sync with: src/lib/constants.ts (frontend)
 */
export const ADMIN_USER_ID = "38a1c53d-b99e-4958-9bb2-18663d8b9b3e";

/**
 * Check if a user has admin role using the has_role RPC
 * @param supabase - Supabase client instance
 * @param userId - User ID to check
 * @returns boolean indicating if user is admin
 */
export async function isUserAdmin(
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return !!data;
  } catch (e) {
    console.error("Exception checking admin status:", e);
    return false;
  }
}

/**
 * Verify admin access and return error response if not authorized
 * Use this at the start of admin-only edge functions
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID to verify
 * @param corsHeaders - CORS headers to include in response
 * @returns Response if unauthorized, null if authorized
 */
export async function requireAdmin(
  supabase: any,
  userId: string,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  const isAdmin = await isUserAdmin(supabase, userId);
  
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ error: "Forbidden: Admin access required" }),
      { 
        status: 403, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
  
  return null;
}
