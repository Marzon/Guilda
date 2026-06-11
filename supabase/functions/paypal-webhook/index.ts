import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-cert-url, paypal-auth-algo, paypal-transmission-sig',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event = await req.json();
    console.log('=== PayPal Webhook Received ===');
    console.log('Event Type:', event.event_type);
    console.log('Event ID:', event.id);
    console.log('Full Event:', JSON.stringify(event, null, 2));

    // Get PayPal configuration
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'live';
    const paypalApiUrl = paypalMode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
    
    const clientId = paypalMode === 'sandbox'
      ? Deno.env.get('PAYPAL_SANDBOX_CLIENT_ID')
      : Deno.env.get('PAYPAL_CLIENT_ID');
    
    const clientSecret = paypalMode === 'sandbox'
      ? Deno.env.get('PAYPAL_SANDBOX_SECRET')
      : Deno.env.get('PAYPAL_SECRET');

    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');

    console.log('PayPal Mode:', paypalMode);
    console.log('Webhook ID configured:', !!webhookId);

    // Verify webhook signature if webhook ID is configured
    if (webhookId) {
      const transmissionId = req.headers.get('paypal-transmission-id');
      const transmissionTime = req.headers.get('paypal-transmission-time');
      const certUrl = req.headers.get('paypal-cert-url');
      const authAlgo = req.headers.get('paypal-auth-algo');
      const transmissionSig = req.headers.get('paypal-transmission-sig');

      console.log('Webhook Headers:', {
        transmissionId,
        transmissionTime,
        certUrl,
        authAlgo,
        transmissionSig: transmissionSig ? '***' : null,
      });

      if (transmissionId && transmissionTime && certUrl && authAlgo && transmissionSig) {
        try {
          // Get PayPal access token
          const authResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-Language': 'en_US',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            },
            body: 'grant_type=client_credentials',
          });

          if (!authResponse.ok) {
            console.error('PayPal auth failed:', await authResponse.text());
            throw new Error('Failed to authenticate with PayPal');
          }

          const { access_token } = await authResponse.json();
          console.log('PayPal auth successful for verification');

          // Verify webhook signature
          const verifyResponse = await fetch(`${paypalApiUrl}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transmission_id: transmissionId,
              transmission_time: transmissionTime,
              cert_url: certUrl,
              auth_algo: authAlgo,
              transmission_sig: transmissionSig,
              webhook_id: webhookId,
              webhook_event: event
            })
          });

          const verifyResult = await verifyResponse.json();
          console.log('Signature verification result:', verifyResult);

          if (verifyResult.verification_status !== 'SUCCESS') {
            console.error('Webhook signature verification failed');
            return new Response(
              JSON.stringify({ error: 'Invalid webhook signature' }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401 
              }
            );
          }

          console.log('✅ Webhook signature verified successfully');
        } catch (verifyError: any) {
          console.error('Error verifying webhook signature:', verifyError);
          return new Response(
            JSON.stringify({ error: 'Webhook signature verification failed' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          );
        }
      } else {
        console.warn('⚠️ Missing webhook signature headers, skipping verification');
      }
    } else {
      console.warn('⚠️ PAYPAL_WEBHOOK_ID not configured, skipping signature verification');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle payment events
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || 
        event.event_type === 'CHECKOUT.ORDER.COMPLETED' || 
        event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      
      console.log('Processing payment event...');
      
      // Extract order information from different event structures
      let orderId: string | undefined;
      let customId: string | undefined;

      if (event.resource?.id) {
        orderId = event.resource.id;
      }

      // Try to get custom_id from different possible locations
      if (event.resource?.purchase_units?.[0]?.custom_id) {
        customId = event.resource.purchase_units[0].custom_id;
      } else if (event.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id) {
        customId = event.resource.purchase_units[0].payments.captures[0].custom_id;
      }

      console.log('Order ID:', orderId);
      console.log('Custom ID:', customId);
      
      if (!customId) {
        console.error('No custom_id found in webhook event');
        console.log('Resource structure:', JSON.stringify(event.resource, null, 2));
        return new Response('OK', { 
          headers: corsHeaders,
          status: 200 
        });
      }

      let parsedCustomId;
      try {
        parsedCustomId = JSON.parse(customId);
      } catch (e) {
        console.error('Failed to parse custom_id:', e);
        return new Response('OK', { 
          headers: corsHeaders,
          status: 200 
        });
      }

      const { user_id, product_type } = parsedCustomId;
      console.log('Processing order for user:', user_id, 'product:', product_type);

      if (product_type === 'founder_pass') {
        console.log('Upgrading user to FOUNDER tier...');
        
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id,
            tier: 'FOUNDER',
            purchased_at: new Date().toISOString(),
            paypal_order_id: orderId,
          });

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }

        console.log('✅ User upgraded to FOUNDER tier successfully');
      } 
      else if (product_type === 'tavern_board') {
        console.log('Adding 48h boost...');
        
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        const { error } = await supabase
          .from('profile_boosts')
          .insert({
            user_id,
            expires_at: expiresAt.toISOString(),
            paypal_order_id: orderId,
          });

        if (error) {
          console.error('Error adding boost:', error);
          throw error;
        }

        console.log('✅ User boosted for 48h successfully');
      }
    } else {
      console.log('Event type not handled:', event.event_type);
    }

    console.log('=== Webhook processing completed ===');
    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });
  } catch (error: any) {
    console.error('=== Webhook error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
