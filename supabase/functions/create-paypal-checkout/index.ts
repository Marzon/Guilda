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
    const { product_type } = await req.json();
    console.log('Creating PayPal checkout for:', product_type);

    const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    console.log('PayPal mode:', mode);

    // Get user info
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // TEST MODE: Simulate checkout without PayPal
    if (mode === 'test') {
      console.log('Test mode: simulating checkout');
      const origin = req.headers.get('origin') || 'http://localhost:5173';
      return new Response(
        JSON.stringify({ 
          orderId: `TEST-${Date.now()}`,
          approvalUrl: `${origin}/success?test=true&product=${product_type}&user=${user.id}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // SANDBOX OR PRODUCTION MODE: Use real PayPal
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
    console.log('PayPal auth successful');
    
    if (!authData.access_token) {
      console.error('No access token in response:', authData);
      throw new Error('Failed to get PayPal access token');
    }
    
    const accessToken = authData.access_token;

    // Define products
    const products: Record<string, { name: string; amount: string; description: string }> = {
      founder_pass: {
        name: "Founder's Pass - Lifetime Access",
        amount: "97.00",
        description: "Acesso vitalício com matches ilimitados e badge exclusivo"
      },
      tavern_board: {
        name: "Tavern Board Boost - 48h",
        amount: "19.90", 
        description: "Destaque seu perfil por 48 horas com borda dourada"
      }
    };

    const product = products[product_type];
    if (!product) {
      throw new Error('Invalid product type');
    }

    // Create PayPal order
    const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'BRL',
            value: product.amount,
          },
          description: product.description,
          custom_id: JSON.stringify({
            user_id: user.id,
            product_type,
          }),
        }],
        application_context: {
          brand_name: 'Guilda',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${req.headers.get('origin')}/success`,
          cancel_url: `${req.headers.get('origin')}/pricing`,
        },
      }),
    });

    const orderData = await orderResponse.json();
    console.log('PayPal order response:', JSON.stringify(orderData, null, 2));

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', orderData);
      throw new Error(`PayPal order failed: ${orderData.message || 'Unknown error'}`);
    }

    if (!orderData.links || !Array.isArray(orderData.links)) {
      console.error('Invalid order response - no links array:', orderData);
      throw new Error('Invalid PayPal order response');
    }

    // Find approval link
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;
    
    if (!approvalUrl) {
      console.error('No approval URL in order links:', orderData.links);
      throw new Error('PayPal approval URL not found');
    }

    return new Response(
      JSON.stringify({ 
        orderId: orderData.id,
        approvalUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
