import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialPostValidation {
  is_valid_post: boolean;
  platform_detected: string;
  mentions_guilda: boolean;
  is_authentic: boolean;
  is_published: boolean;
  confidence: number;
  rejection_reasons: string[];
}

const SUPPORTED_PLATFORMS = ['whatsapp', 'linkedin', 'instagram', 'tiktok', 'telegram', 'facebook', 'discord', 'slack'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { platform, evidence_image } = await req.json();

    if (!platform || !evidence_image) {
      throw new Error('Missing required fields: platform, evidence_image');
    }

    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      throw new Error(`Invalid platform. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`);
    }

    console.log(`Processing social post verification for user ${user.id}, platform: ${platform}`);

    // Check if user already has an approved submission in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: existingApproved } = await supabase
      .from('social_payment_submissions')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .gte('created_at', sixMonthsAgo.toISOString())
      .limit(1);

    if (existingApproved && existingApproved.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Você já ativou o plano Founder via pagamento social nos últimos 6 meses.',
        existing_approval_date: existingApproved[0].created_at
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has FOUNDER subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('tier, expires_at')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription && existingSubscription.tier === 'FOUNDER') {
      const expiresAt = existingSubscription.expires_at ? new Date(existingSubscription.expires_at) : null;
      if (!expiresAt || expiresAt > new Date()) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Você já possui um plano Founder ativo.',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create submission record
    const { data: submission, error: insertError } = await supabase
      .from('social_payment_submissions')
      .insert({
        user_id: user.id,
        platform,
        evidence_url: evidence_image,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError || !submission) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to create submission record');
    }

    console.log(`Submission record created: ${submission.id}`);

    // Call AI to analyze the social post
    const aiPrompt = `Analise esta imagem de uma postagem em rede social.

Verifique:
1. É uma postagem REAL de uma destas plataformas?
   - WhatsApp (status ou grupo)
   - LinkedIn (post no feed)
   - Instagram (story, feed ou reels)
   - TikTok (vídeo publicado)
   - Telegram (canal ou grupo)
   - Facebook (post ou story)
   - Discord (mensagem em servidor)
   - Slack (mensagem em workspace)

2. O conteúdo menciona "Guilda", "guilda.app", "cofounders", "encontrar sócio", ou está recomendando uma plataforma de networking para startups/empreendedores?

3. A interface da rede social parece autêntica (não editada/manipulada)?

4. O post parece ter sido publicado (não é apenas preview/rascunho)?

Responda APENAS em JSON:
{
  "is_valid_post": true/false,
  "platform_detected": "whatsapp" | "linkedin" | "instagram" | "tiktok" | "telegram" | "facebook" | "discord" | "slack" | "unknown",
  "mentions_guilda": true/false,
  "is_authentic": true/false,
  "is_published": true/false,
  "confidence": 0.0-1.0,
  "rejection_reasons": ["motivo1", "motivo2"]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: aiPrompt },
              { type: 'image_url', image_url: { url: evidence_image } }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      // Check for rate limiting
      if (aiResponse.status === 429) {
        await supabase
          .from('social_payment_submissions')
          .update({ status: 'rejected', rejection_reasons: ['Serviço temporariamente indisponível. Tente novamente em alguns minutos.'] })
          .eq('id', submission.id);
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Failed to analyze post with AI');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '{}';
    
    console.log('AI response:', aiContent);

    let validationResult: SocialPostValidation;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      validationResult = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      validationResult = {
        is_valid_post: false,
        platform_detected: 'unknown',
        mentions_guilda: false,
        is_authentic: false,
        is_published: false,
        confidence: 0,
        rejection_reasons: ['Não foi possível analisar a imagem. Por favor, envie uma imagem mais clara.']
      };
    }

    // Update submission with AI results
    await supabase
      .from('social_payment_submissions')
      .update({
        ai_confidence: validationResult.confidence,
        platform_detected: validationResult.platform_detected,
      })
      .eq('id', submission.id);

    // Validate the post
    const rejectionReasons: string[] = [];
    let isValid = true;

    // Check platform detection
    if (!validationResult.is_valid_post || validationResult.platform_detected === 'unknown') {
      rejectionReasons.push('Não foi possível identificar a plataforma da postagem');
      isValid = false;
    }

    // Check if mentions Guilda
    if (!validationResult.mentions_guilda) {
      rejectionReasons.push('A postagem não menciona a Guilda ou termos relacionados');
      isValid = false;
    }

    // Check authenticity
    if (!validationResult.is_authentic) {
      rejectionReasons.push('A imagem parece ter sido editada ou manipulada');
      isValid = false;
    }

    // Check if published
    if (!validationResult.is_published) {
      rejectionReasons.push('A postagem parece ser um rascunho ou preview, não uma publicação real');
      isValid = false;
    }

    // Check confidence threshold (0.75)
    if (validationResult.confidence < 0.75) {
      rejectionReasons.push('Baixa confiança na análise. Por favor, envie uma imagem mais clara.');
      isValid = false;
    }

    // Add any AI-generated rejection reasons
    if (validationResult.rejection_reasons && validationResult.rejection_reasons.length > 0) {
      rejectionReasons.push(...validationResult.rejection_reasons);
    }

    if (isValid) {
      // Approve submission
      await supabase
        .from('social_payment_submissions')
        .update({
          status: 'approved',
        })
        .eq('id', submission.id);

      // Activate FOUNDER subscription for 6 months
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: 'FOUNDER',
          purchased_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }, { onConflict: 'user_id' });

      console.log(`Social payment approved for user ${user.id}. FOUNDER subscription activated until ${expiresAt.toISOString()}`);

      // Send welcome email
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        await fetch(`${supabaseUrl}/functions/v1/send-subscription-welcome`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_email: user.email,
            user_name: profile?.username || 'Aventureiro',
            tier: 'FOUNDER',
            product_type: 'social_payment',
            locale: 'pt',
          }),
        });
        
        console.log('Welcome email sent for social payment activation');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return new Response(JSON.stringify({
        success: true,
        status: 'approved',
        message: 'Parabéns! Seu plano Founder foi ativado por 6 meses!',
        expires_at: expiresAt.toISOString(),
        platform_detected: validationResult.platform_detected,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Reject submission
      await supabase
        .from('social_payment_submissions')
        .update({
          status: 'rejected',
          rejection_reasons: rejectionReasons,
        })
        .eq('id', submission.id);

      console.log(`Social payment rejected for user ${user.id}: ${rejectionReasons.join('; ')}`);

      return new Response(JSON.stringify({
        success: false,
        status: 'rejected',
        message: 'Postagem não aprovada',
        reasons: rejectionReasons,
        platform_detected: validationResult.platform_detected,
        confidence: validationResult.confidence,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Error in verify-social-post:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro ao processar verificação'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});