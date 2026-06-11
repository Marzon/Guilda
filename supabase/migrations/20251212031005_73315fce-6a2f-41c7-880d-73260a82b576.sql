-- Table to track which tools were suggested to each user
CREATE TABLE IF NOT EXISTS public.user_suggested_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  suggested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_name)
);

-- Enable RLS
ALTER TABLE public.user_suggested_tools ENABLE ROW LEVEL SECURITY;

-- Only service role can manage this table
CREATE POLICY "Service role can manage suggested tools"
  ON public.user_suggested_tools
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role');

-- Function to send tool suggestion when project welcome message is read
CREATE OR REPLACE FUNCTION public.send_tool_suggestion_on_read()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id UUID := '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';
  reader_id UUID;
  conversation_record RECORD;
  random_tool RECORD;
  tool_message TEXT;
  tools_array JSONB;
BEGIN
  -- Only trigger when read_at changes from NULL to a value
  IF OLD.read_at IS NOT NULL OR NEW.read_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only for messages sent by admin
  IF NEW.sender_id != admin_user_id THEN
    RETURN NEW;
  END IF;

  -- Check if this is the project welcome message
  IF NEW.content NOT LIKE '%Muito legal ver que você já tem um projeto%' THEN
    RETURN NEW;
  END IF;

  -- Get conversation to find the reader
  SELECT * INTO conversation_record
  FROM conversations
  WHERE id = NEW.conversation_id;

  IF conversation_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine reader (the one who is not admin)
  IF conversation_record.participant_1 = admin_user_id THEN
    reader_id := conversation_record.participant_2;
  ELSE
    reader_id := conversation_record.participant_1;
  END IF;

  -- Define all available tools with their info
  tools_array := '[
    {"name": "equity-calculator", "title": "Calculadora de Equity", "url": "https://guilda.app.br/equity-calculator", "reason": "Dividir equity de forma justa é crucial para evitar conflitos futuros entre co-fundadores. Esta ferramenta te ajuda a definir percentuais baseados em contribuição, risco e dedicação."},
    {"name": "runway-calculator", "title": "Calculadora de Runway", "url": "https://guilda.app.br/runway-calculator", "reason": "Saber exatamente quantos meses de operação você tem antes de precisar de mais capital é essencial para tomar decisões estratégicas no timing certo."},
    {"name": "valuation-calculator", "title": "Calculadora de Valuation", "url": "https://guilda.app.br/valuation-calculator", "reason": "Entender o valor da sua startup usando diferentes metodologias te prepara melhor para conversas com investidores e negociações de equity."},
    {"name": "contract-generator", "title": "Gerador de Contrato de Vesting", "url": "https://guilda.app.br/contract-generator", "reason": "Proteger a empresa com contratos de vesting bem estruturados evita problemas se algum co-fundador sair antes do tempo."},
    {"name": "unit-economics", "title": "Calculadora de Unit Economics", "url": "https://guilda.app.br/unit-economics", "reason": "Entender seu LTV, CAC e payback period é fundamental para provar que seu modelo de negócio é escalável e lucrativo."},
    {"name": "cap-table", "title": "Simulador de Cap Table", "url": "https://guilda.app.br/cap-table", "reason": "Visualizar como seu equity será diluído em rodadas futuras te ajuda a planejar melhor e negociar termos mais favoráveis."},
    {"name": "burn-rate-optimizer", "title": "Otimizador de Burn Rate", "url": "https://guilda.app.br/burn-rate-optimizer", "reason": "Identificar onde você pode cortar custos sem prejudicar o crescimento pode ser a diferença entre sobreviver e fechar as portas."},
    {"name": "tam-sam-som", "title": "Calculadora TAM SAM SOM", "url": "https://guilda.app.br/tam-sam-som", "reason": "Dimensionar seu mercado corretamente é o primeiro passo para convencer investidores do potencial do seu negócio."},
    {"name": "business-model", "title": "Business Model Canvas", "url": "https://guilda.app.br/business-model", "reason": "Mapear todos os elementos do seu modelo de negócio em uma página te dá clareza e facilita comunicar sua visão para parceiros."},
    {"name": "swot", "title": "Análise SWOT", "url": "https://guilda.app.br/swot", "reason": "Identificar forças, fraquezas, oportunidades e ameaças te ajuda a criar estratégias mais robustas e antecipar problemas."},
    {"name": "empathy-map", "title": "Mapa de Empatia", "url": "https://guilda.app.br/empathy-map", "reason": "Entender profundamente o que seu cliente pensa, sente e faz é o segredo para criar produtos que realmente resolvem problemas."},
    {"name": "archetype-quiz", "title": "Quiz: Builder ou Seller?", "url": "https://guilda.app.br/archetype-quiz", "reason": "Descobrir seu arquétipo te ajuda a entender melhor suas forças e encontrar o co-fundador complementar ideal."}
  ]'::jsonb;

  -- Pick a random tool that hasn't been suggested to this user yet
  SELECT elem->>'name' as name, elem->>'title' as title, elem->>'url' as url, elem->>'reason' as reason
  INTO random_tool
  FROM jsonb_array_elements(tools_array) elem
  WHERE NOT EXISTS (
    SELECT 1 FROM user_suggested_tools ust
    WHERE ust.user_id = reader_id
    AND ust.tool_name = elem->>'name'
  )
  ORDER BY random()
  LIMIT 1;

  -- If no tools left to suggest, return
  IF random_tool IS NULL THEN
    RETURN NEW;
  END IF;

  -- Record this tool as suggested
  INSERT INTO user_suggested_tools (user_id, tool_name)
  VALUES (reader_id, random_tool.name)
  ON CONFLICT (user_id, tool_name) DO NOTHING;

  -- Build the message
  tool_message := 'Obrigado por ler minha mensagem! 😊

Aproveitando, quero te apresentar uma ferramenta que pode te ajudar muito:

🛠️ **' || random_tool.title || '**
' || random_tool.url || '

' || random_tool.reason || '

Experimenta e me conta o que achou! 💪';

  -- Send the follow-up message
  INSERT INTO messages (conversation_id, sender_id, content, created_at)
  VALUES (NEW.conversation_id, admin_user_id, tool_message, now() + interval '2 seconds');

  -- Update conversation last_message_at
  UPDATE conversations
  SET last_message_at = now() + interval '2 seconds'
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;

-- Create trigger for message read events
DROP TRIGGER IF EXISTS on_message_read_send_tool ON messages;
CREATE TRIGGER on_message_read_send_tool
  AFTER UPDATE OF read_at ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_tool_suggestion_on_read();