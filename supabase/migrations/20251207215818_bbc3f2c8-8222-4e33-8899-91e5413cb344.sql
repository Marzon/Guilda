-- Create function to send welcome message to new users
CREATE OR REPLACE FUNCTION public.send_welcome_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'; -- Rob's user ID
  new_conversation_id UUID;
  welcome_message TEXT;
BEGIN
  -- Don't send message to admin themselves
  IF NEW.id = admin_user_id THEN
    RETURN NEW;
  END IF;

  -- Create welcome message content
  welcome_message := '👋 Olá ' || NEW.username || '! Bem-vindo(a) à Guilda!

🎉 Obrigado por se cadastrar na nossa plataforma de conexão entre Builders e Sellers.

Aqui estão as principais funcionalidades:

🏰 **Taverna** - Explore perfis de outros fundadores e envie convites de conexão

📋 **Projetos** - Crie seu projeto e recrute co-fundadores para sua equipe

💬 **Mensagens** - Converse com suas conexões aceitas

🧰 **Ferramentas** - Use nossas calculadoras gratuitas (Equity, Runway, Valuation, etc.)

📚 **Academy** - Leia artigos e guias sobre empreendedorismo

Qualquer dúvida, é só me mandar uma mensagem aqui!

Bons negócios! 🚀';

  -- Create conversation between admin and new user
  INSERT INTO public.conversations (participant_1, participant_2, last_message_at)
  VALUES (admin_user_id, NEW.id, now())
  RETURNING id INTO new_conversation_id;

  -- Insert welcome message from admin
  INSERT INTO public.messages (conversation_id, sender_id, content, created_at)
  VALUES (new_conversation_id, admin_user_id, welcome_message, now());

  RETURN NEW;
END;
$$;

-- Create trigger to send welcome message after profile creation
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_message();