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
    const { orderId } = await req.json();
    console.log('Capturing PayPal payment for order:', orderId);

    const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    
    // Get auth token from user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Get PayPal credentials
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Select PayPal API URL based on mode
    const paypalApiUrl = mode === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    
    console.log('Using PayPal API:', paypalApiUrl);

    // Get auth token
    const authResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('PayPal auth failed:', authResponse.status, errorText);
      throw new Error(`PayPal authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the payment
    console.log('Capturing payment...');
    const captureResponse = await fetch(
      `${paypalApiUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const captureData = await captureResponse.json();
    console.log('Capture response:', JSON.stringify(captureData, null, 2));

    if (!captureResponse.ok) {
      console.error('Payment capture failed:', captureData);
      throw new Error(`Payment capture failed: ${captureData.message || 'Unknown error'}`);
    }

    // Extract product info from custom_id
    const customId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id 
                  || captureData.purchase_units?.[0]?.custom_id;
    
    if (!customId) {
      console.error('No custom_id found in capture response');
      throw new Error('Missing order information');
    }

    const { product_type } = JSON.parse(customId);
    console.log('Product type:', product_type);

    // Use service role to update subscription
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (product_type === 'founder_pass') {
      // Upgrade to FOUNDER tier
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: 'FOUNDER',
          purchased_at: new Date().toISOString(),
          paypal_order_id: orderId,
        });

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log('User upgraded to FOUNDER tier');
    } 
    else if (product_type === 'tavern_board') {
      // Add 48h boost
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const { error } = await supabaseAdmin
        .from('profile_boosts')
        .insert({
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
          paypal_order_id: orderId,
        });

      if (error) {
        console.error('Error adding boost:', error);
        throw error;
      }

      console.log('User boosted for 48h');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment captured successfully',
        captureId: captureData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error capturing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
