import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  platform: string;
  evidence_image: string;
  locale?: 'pt' | 'en' | 'es';
}

const SUPPORTED_PLATFORMS = ['whatsapp', 'linkedin', 'instagram', 'tiktok', 'telegram', 'facebook', 'discord', 'slack'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    const body: SignupRequest = await req.json();
    const { name, email, phone, platform, evidence_image, locale = 'pt' } = body;

    // Validate required fields
    if (!name || !email || !phone || !platform || !evidence_image) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Campos obrigatórios: name, email, phone, platform, evidence_image'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email inválido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate platform
    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Plataforma inválida. Suportadas: ${SUPPORTED_PLATFORMS.join(', ')}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing social payment signup for email: ${email}, platform: ${platform}`);

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw new Error('Erro ao verificar usuário existente');
    }

    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // User exists - just send magic link
      userId = existingUser.id;
      console.log(`User already exists: ${userId}`);

      // Check if user already has approved social payment in last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: existingApproved } = await supabase
        .from('social_payment_submissions')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .gte('created_at', sixMonthsAgo.toISOString())
        .limit(1);

      if (existingApproved && existingApproved.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Este email já ativou o plano Founder via pagamento social nos últimos 6 meses.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Create new user
      isNewUser = true;
      
      // Generate a secure random password (user will login via magic link)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm since they'll use magic link
        user_metadata: {
          name,
          phone,
          signup_source: 'social_payment',
          archetype: null, // Will be set during onboarding
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw new Error('Erro ao criar conta');
      }

      userId = newUser.user.id;
      console.log(`New user created: ${userId}`);

      // Create initial profile (will be completed during onboarding)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: name.toLowerCase().replace(/\s+/g, '_').substring(0, 20) + '_' + Date.now().toString(36),
          archetype: 'BUILDER', // Default, will be changed in onboarding
          bio: null,
          looking_for: null,
          offering: null,
          main_skills: [],
          phone: phone,
          avatar_url: null,
          signup_source: 'social_payment',
          onboarding_completed: false,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw - user was created, profile will be created during onboarding
      }
    }

    // Store the social payment submission as pending
    const { data: submission, error: submissionError } = await supabase
      .from('social_payment_submissions')
      .insert({
        user_id: userId,
        platform,
        evidence_url: evidence_image,
        status: 'pending_verification',
        signup_name: name,
        signup_email: email,
        signup_phone: phone,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      // Continue anyway - the verification can be done later
    } else {
      console.log(`Submission created: ${submission.id}`);
    }

    // Generate magic link
    const redirectTo = 'https://suprema.guilda.app.br/social-payment-callback';
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo,
      }
    });

    if (linkError) {
      console.error('Error generating magic link:', linkError);
      throw new Error('Erro ao gerar link de acesso');
    }

    console.log(`Magic link generated for ${email}`);

    // Send magic link email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      const magicLinkUrl = linkData.properties?.action_link;
      
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #FFFBF7;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://guilda.app.br/logo.png" alt="Guilda" width="120" style="margin-bottom: 16px;">
      <h1 style="color: #7610DC; font-size: 28px; margin: 0;">Bem-vindo à Guilda! 🎉</h1>
    </div>
    
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Olá <strong>${name}</strong>!
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Obrigado por divulgar a Guilda! Seu pedido de <strong>6 meses grátis</strong> do plano Founder está sendo processado.
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Clique no botão abaixo para acessar sua conta e continuar o cadastro:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #7610DC, #4308B0); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Acessar Minha Conta
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="${magicLinkUrl}" style="color: #7610DC; word-break: break-all;">${magicLinkUrl}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        Este link expira em 1 hora. Se você não solicitou este email, pode ignorá-lo.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} Guilda. Conectando Builders & Sellers.
      </p>
    </div>
  </div>
</body>
</html>`;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Guilda <noreply@guilda.app.br>',
          to: [email],
          subject: `${name}, seu acesso à Guilda! 🚀`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Error sending email via Resend:', errorText);
        // Don't throw - we can still return the magic link
      } else {
        console.log('Magic link email sent successfully');
      }
    } else {
      console.warn('RESEND_API_KEY not configured, skipping email');
    }

    return new Response(JSON.stringify({
      success: true,
      message: isNewUser 
        ? 'Conta criada! Verifique seu email para o link de acesso.'
        : 'Link de acesso enviado! Verifique seu email.',
      is_new_user: isNewUser,
      submission_id: submission?.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error in social-payment-signup:', errorMessage);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
