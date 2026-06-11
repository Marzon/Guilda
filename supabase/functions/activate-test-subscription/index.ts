import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    
    // Only allow in test mode
    if (mode !== 'test') {
      throw new Error('Test subscription activation only available in test mode');
    }

    const { product_type } = await req.json();
    console.log('Activating test subscription for:', product_type);

    // Get user info
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Use service role for updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (product_type === 'founder_pass') {
      // Activate founder subscription
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: 'FOUNDER',
          purchased_at: new Date().toISOString(),
          paypal_order_id: `TEST-${Date.now()}`,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      console.log('Founder subscription activated for user:', user.id);

    } else if (product_type === 'tavern_board') {
      // Activate boost
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const { error } = await supabase
        .from('profile_boosts')
        .insert({
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
          paypal_order_id: `TEST-${Date.now()}`,
        });

      if (error) throw error;
      console.log('Boost activated for user:', user.id);

    } else {
      throw new Error('Invalid product type');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Test subscription activated' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error activating test subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
