import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VeriphoneResponse {
  status: string;
  phone: string;
  phone_valid: boolean;
  phone_type: string;
  phone_region: string;
  country: string;
  country_code: string;
  country_prefix: string;
  international_number: string;
  local_number: string;
  e164: string;
  carrier: string;
}

interface ValidationResult {
  valid: boolean;
  phone_type?: string;
  carrier?: string;
  e164?: string;
  formatted?: string;
  country?: string;
  error?: string;
  source: 'veriphone' | 'local';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, defaultCountry = 'BR' } = await req.json();

    if (!phone || typeof phone !== 'string') {
      console.error('Invalid phone input:', phone);
      return new Response(
        JSON.stringify({ valid: false, error: 'Phone number is required', source: 'local' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the phone number - remove spaces, dashes, parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Basic length validation
    if (cleanPhone.length < 8 || cleanPhone.length > 20) {
      console.log('Phone failed length validation:', cleanPhone.length);
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid phone number length', source: 'local' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VERIPHONE_API_KEY');
    
    if (!apiKey) {
      console.error('VERIPHONE_API_KEY not configured');
      // Fallback to basic validation if no API key
      return new Response(
        JSON.stringify({ 
          valid: cleanPhone.length >= 10, 
          e164: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
          source: 'local',
          error: cleanPhone.length < 10 ? 'Phone number too short' : undefined
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone for Veriphone API
    let phoneToValidate = cleanPhone;
    if (!phoneToValidate.startsWith('+')) {
      // Add country prefix if not present
      const countryPrefixes: Record<string, string> = {
        'BR': '55',
        'US': '1',
        'PT': '351',
        'ES': '34',
        'AR': '54',
        'MX': '52',
        'CO': '57',
        'CL': '56',
      };
      const prefix = countryPrefixes[defaultCountry] || '55';
      phoneToValidate = `+${prefix}${phoneToValidate}`;
    }

    console.log('Validating phone with Veriphone:', phoneToValidate);

    const response = await fetch(
      `https://api.veriphone.io/v2/verify?phone=${encodeURIComponent(phoneToValidate)}&key=${apiKey}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      console.error('Veriphone API error:', response.status, await response.text());
      // Fallback to basic validation on API error
      return new Response(
        JSON.stringify({ 
          valid: true, 
          e164: phoneToValidate,
          source: 'local',
          error: 'Could not verify with external service'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: VeriphoneResponse = await response.json();
    console.log('Veriphone response:', JSON.stringify(data));

    const result: ValidationResult = {
      valid: data.phone_valid,
      phone_type: data.phone_type,
      carrier: data.carrier,
      e164: data.e164,
      formatted: data.international_number,
      country: data.country,
      source: 'veriphone',
    };

    if (!data.phone_valid) {
      result.error = 'Invalid phone number';
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating phone:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error', source: 'local' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
