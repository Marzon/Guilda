import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PixReceiptData {
  amount: number | null;
  transaction_id: string | null;
  date: string | null;
  pix_key: string | null;
  confidence: number;
}

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

    const { product_type, receipt_image } = await req.json();

    if (!product_type || !receipt_image) {
      throw new Error('Missing required fields: product_type, receipt_image');
    }

    console.log(`Processing receipt for user ${user.id}, product: ${product_type}`);

    // Verificar se já existe boost ativo para tavern_board
    if (product_type === 'tavern_board') {
      const { data: activeBoosts } = await supabase
        .from('profile_boosts')
        .select('id, expires_at')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (activeBoosts && activeBoosts.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Você já possui um boost ativo. Aguarde a expiração para ativar um novo.',
          boost_expires_at: activeBoosts[0].expires_at
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1. Buscar configuração do produto
    const { data: pixConfig, error: configError } = await supabase
      .from('pix_config')
      .select('*')
      .eq('product_type', product_type)
      .single();

    if (configError || !pixConfig) {
      throw new Error('Invalid product type');
    }

    console.log(`Expected PIX key: ${pixConfig.pix_key}, Expected amount: ${pixConfig.expected_amount}`);

    // 2. Criar registro do comprovante
    const { data: receipt, error: insertError } = await supabase
      .from('payment_receipts')
      .insert({
        user_id: user.id,
        product_type,
        receipt_url: receipt_image, // URL ou base64
        status: 'reviewing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error details:', JSON.stringify(insertError));
      throw new Error(`Failed to create receipt record: ${insertError.message}`);
    }
    
    if (!receipt) {
      throw new Error('Failed to create receipt record: no data returned');
    }

    console.log(`Receipt record created: ${receipt.id}`);

    // 3. Chamar IA para extrair dados do comprovante
    const aiPrompt = `Analise este comprovante de pagamento PIX brasileiro e extraia as seguintes informações:

1. Valor pago em reais (apenas número, ex: 97.00)
2. ID da transação (código E2E - geralmente uma string alfanumérica longa que começa com E)
3. Data e hora da transação no formato ISO 8601 (ex: 2024-01-15T14:30:00-03:00)

Responda APENAS em formato JSON válido, sem texto adicional:
{
  "amount": 97.00,
  "transaction_id": "E123456789...",
  "date": "2024-01-15T14:30:00-03:00",
  "pix_key": null,
  "confidence": 0.95
}

Se não conseguir extrair algum campo com certeza, use null para esse campo.
O campo confidence deve ser um número entre 0 e 1 indicando sua confiança na extração.
O campo pix_key pode ser sempre null, não é necessário extraí-lo.`;

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
              { type: 'image_url', image_url: { url: receipt_image } }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to analyze receipt with AI');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '{}';
    
    console.log('AI response:', aiContent);

    let extractedData: PixReceiptData;
    try {
      // Tentar extrair JSON do conteúdo (pode vir com texto extra)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      extractedData = {
        amount: null,
        transaction_id: null,
        date: null,
        pix_key: null,
        confidence: 0
      };
    }

    // 4. Atualizar registro com dados extraídos
    await supabase
      .from('payment_receipts')
      .update({
        extracted_amount: extractedData.amount,
        extracted_transaction_id: extractedData.transaction_id,
        extracted_date: extractedData.date,
        extracted_pix_key: extractedData.pix_key,
        ai_confidence: extractedData.confidence,
      })
      .eq('id', receipt.id);

    console.log('Extracted data:', extractedData);

    // 5. Validar dados extraídos
    const validations: string[] = [];
    let isValid = true;

    // Validar valor
    if (!extractedData.amount || Math.abs(extractedData.amount - pixConfig.expected_amount) > 0.01) {
      validations.push(`Valor incorreto. Esperado: R$ ${pixConfig.expected_amount}, Encontrado: R$ ${extractedData.amount || 'não identificado'}`);
      isValid = false;
    }

    // Validar chave PIX (não obrigatório já que estamos usando link de pagamento)
    // A validação principal será feita pelo valor e ID da transação

    // Validar ID da transação (verificar se não foi usado antes)
    if (extractedData.transaction_id) {
      const { data: usedTx } = await supabase
        .from('used_transactions')
        .select('id')
        .eq('transaction_id', extractedData.transaction_id)
        .single();

      if (usedTx) {
        validations.push('Este comprovante já foi utilizado anteriormente');
        isValid = false;
      }
    } else {
      validations.push('ID da transação não identificado');
      isValid = false;
    }

    // Validar data (deve ser das últimas 48h)
    if (extractedData.date) {
      const txDate = new Date(extractedData.date);
      const now = new Date();
      const hoursDiff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 48) {
        validations.push('Comprovante muito antigo (mais de 48 horas)');
        isValid = false;
      } else if (hoursDiff < 0) {
        validations.push('Data do comprovante é futura');
        isValid = false;
      }
    } else {
      validations.push('Data da transação não identificada');
      isValid = false;
    }

    // Validar confiança da IA (reduzido para 0.6 já que não validamos mais a chave PIX)
    if (extractedData.confidence < 0.6) {
      validations.push('Baixa confiança na extração dos dados (imagem pode estar ilegível)');
      isValid = false;
    }

    // 6. Aprovar ou rejeitar
    if (isValid) {
      // Aprovar pagamento
      await supabase
        .from('payment_receipts')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'ai',
        })
        .eq('id', receipt.id);

      // Registrar transação como usada
      await supabase
        .from('used_transactions')
        .insert({
          transaction_id: extractedData.transaction_id,
          user_id: user.id,
          payment_receipt_id: receipt.id,
        });

      // Ativar subscription
      if (product_type === 'founder_pass') {
        // Founder Semestral: 6 months subscription with FOUNDER tier
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
      } else if (product_type === 'founders_pass') {
        // Founders Pass Lifetime: FOUNDER tier with no expiration
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            tier: 'FOUNDER',
            purchased_at: new Date().toISOString(),
            expires_at: null, // Lifetime - never expires
          }, { onConflict: 'user_id' });
      } else if (product_type === 'adventurer_pass') {
        // Adventurer: 6 months subscription
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6);
        
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            tier: 'ADVENTURER',
            purchased_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          }, { onConflict: 'user_id' });
      } else if (product_type === 'tavern_board') {
        await supabase
          .from('profile_boosts')
          .insert({
            user_id: user.id,
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 horas
          });
      }

      console.log(`Payment approved for user ${user.id}, product: ${product_type}`);

      // Send welcome email for paid subscriptions
      if (product_type === 'founder_pass' || product_type === 'founders_pass' || product_type === 'adventurer_pass') {
        try {
          // Get user profile for username
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

          const tier = (product_type === 'founder_pass' || product_type === 'founders_pass') ? 'FOUNDER' : 'ADVENTURER';
          
          await fetch(`${supabaseUrl}/functions/v1/send-subscription-welcome`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_email: user.email,
              user_name: profile?.username || 'Aventureiro',
              tier,
              product_type, // Pass product_type to differentiate between semestral and lifetime
              locale: 'pt',
            }),
          });
          
          console.log(`Welcome email sent for ${tier} subscription`);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the payment if email fails
        }
      }

      return new Response(JSON.stringify({
        success: true,
        status: 'approved',
        message: 'Pagamento aprovado com sucesso!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Rejeitar
      const rejectionReason = validations.join('; ');
      
      await supabase
        .from('payment_receipts')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'ai',
        })
        .eq('id', receipt.id);

      console.log(`Payment rejected for user ${user.id}: ${rejectionReason}`);

      return new Response(JSON.stringify({
        success: false,
        status: 'rejected',
        message: 'Comprovante rejeitado',
        reasons: validations,
        extracted_data: extractedData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error: any) {
    console.error('Error in verify-pix-receipt:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
