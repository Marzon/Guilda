-- Fix send_welcome_message trigger to use correct admin ID and handle errors gracefully
CREATE OR REPLACE FUNCTION public.send_welcome_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';  -- Correct admin ID (aguilda)
  new_conversation_id UUID;
  welcome_content TEXT;
BEGIN
  -- Don't send message to admin
  IF NEW.id = admin_id THEN
    RETURN NEW;
  END IF;

  -- Check if admin profile exists (safety check)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id) THEN
    -- Admin not found, skip welcome message but don't fail signup
    RETURN NEW;
  END IF;

  -- Build the welcome message content with links
  welcome_content := '👋 Olá ' || COALESCE(NEW.username, 'Fundador') || '!

Bem-vindo(a) à Guilda! 🎉

Obrigado por se cadastrar na nossa plataforma de conexão entre Builders, Sellers e Investidores.

Aqui estão as principais funcionalidades:

🏰 **Taverna** - Encontre co-founders compatíveis
👉 https://guilda.app.br/tavern

📋 **Startups** - Crie sua startup e recrute membros
👉 https://guilda.app.br/projects

🚀 **Aceleração** - Nosso programa de validação intensiva (Do Or Die)
👉 https://guilda.app.br/aceleracao

💼 **Capital** - Conecte-se com investidores ou veja dealflow
👉 https://guilda.app.br/capital

🧰 **Ferramentas** - Calculadoras gratuitas (Equity, Valuation, Runway, etc.)
👉 https://guilda.app.br/tools

📚 **Academy** - Artigos e guias sobre empreendedorismo
👉 https://guilda.app.br/blog

Qualquer dúvida, é só responder aqui!

Bons negócios! 🚀';

  BEGIN
    -- Create conversation between admin and new user
    INSERT INTO public.conversations (participant_1, participant_2)
    VALUES (admin_id, NEW.id)
    RETURNING id INTO new_conversation_id;

    -- Send welcome message from admin
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (new_conversation_id, admin_id, welcome_content);
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the profile creation
      RAISE WARNING 'Failed to send welcome message: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$;