-- Update the send_welcome_message function with new content and links
CREATE OR REPLACE FUNCTION public.send_welcome_message()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID := 'f14d6435-6eb7-4585-8146-ef9f3e29c2c1';
  new_conversation_id UUID;
  welcome_content TEXT;
BEGIN
  -- Build the welcome message content with links
  welcome_content := '👋 Olá ' || NEW.username || '!

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

  -- Don't send message to admin
  IF NEW.id = admin_id THEN
    RETURN NEW;
  END IF;

  -- Create conversation between admin and new user
  INSERT INTO public.conversations (participant_1, participant_2)
  VALUES (admin_id, NEW.id)
  RETURNING id INTO new_conversation_id;

  -- Send welcome message from admin
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (new_conversation_id, admin_id, welcome_content);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;