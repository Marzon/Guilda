-- Tabela de definição de badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  metric TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de badges conquistados por usuário
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies para badges (público para leitura)
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);

-- Policies para user_badges
CREATE POLICY "Users can view all user badges"
ON public.user_badges FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert user badges"
ON public.user_badges FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own badges notification status"
ON public.user_badges FOR UPDATE
USING (auth.uid() = user_id);

-- Inserir badges iniciais
INSERT INTO public.badges (slug, name, name_en, name_es, description, description_en, description_es, icon, color, category, threshold, metric) VALUES
-- Badges de Networking
('networker_bronze', 'Networker Bronze', 'Bronze Networker', 'Networker Bronce', 'Conquistou 5 conexões aceitas', 'Got 5 accepted connections', 'Consiguió 5 conexiones aceptadas', 'Users', 'from-amber-600 to-amber-800', 'social', 5, 'matches'),
('networker_silver', 'Networker Prata', 'Silver Networker', 'Networker Plata', 'Conquistou 15 conexões aceitas', 'Got 15 accepted connections', 'Consiguió 15 conexiones aceptadas', 'UserCheck', 'from-slate-400 to-slate-600', 'social', 15, 'matches'),
('networker_gold', 'Networker Ouro', 'Gold Networker', 'Networker Oro', 'Conquistou 30 conexões aceitas', 'Got 30 accepted connections', 'Consiguió 30 conexiones aceptadas', 'UserPlus', 'from-yellow-400 to-yellow-600', 'social', 30, 'matches'),
('networker_diamond', 'Networker Diamante', 'Diamond Networker', 'Networker Diamante', 'Conquistou 100 conexões aceitas', 'Got 100 accepted connections', 'Consiguió 100 conexiones aceptadas', 'Crown', 'from-cyan-400 to-blue-600', 'social', 100, 'matches'),

-- Badges de Mensagens
('messenger', 'Mensageiro', 'Messenger', 'Mensajero', 'Enviou 10 mensagens', 'Sent 10 messages', 'Envió 10 mensajes', 'MessageCircle', 'from-green-500 to-emerald-600', 'engagement', 10, 'messages'),
('communicator', 'Comunicador', 'Communicator', 'Comunicador', 'Enviou 50 mensagens', 'Sent 50 messages', 'Envió 50 mensajes', 'MessagesSquare', 'from-teal-500 to-cyan-600', 'engagement', 50, 'messages'),
('influencer', 'Influenciador', 'Influencer', 'Influenciador', 'Enviou 200 mensagens', 'Sent 200 messages', 'Envió 200 mensajes', 'Megaphone', 'from-purple-500 to-pink-600', 'engagement', 200, 'messages'),

-- Badges de Projetos
('founder', 'Fundador Ativo', 'Active Founder', 'Fundador Activo', 'Criou seu primeiro projeto', 'Created first project', 'Creó su primer proyecto', 'Rocket', 'from-orange-500 to-red-600', 'achievement', 1, 'projects'),
('serial_founder', 'Fundador Serial', 'Serial Founder', 'Fundador Serial', 'Criou 3+ projetos', 'Created 3+ projects', 'Creó 3+ proyectos', 'Building2', 'from-red-500 to-rose-700', 'achievement', 3, 'projects'),

-- Badges de XP/Level
('rising_star', 'Estrela Nascente', 'Rising Star', 'Estrella Naciente', 'Alcançou nível 5', 'Reached level 5', 'Alcanzó nivel 5', 'Star', 'from-amber-400 to-orange-500', 'achievement', 5, 'xp'),
('veteran', 'Veterano', 'Veteran', 'Veterano', 'Alcançou nível 10', 'Reached level 10', 'Alcanzó nivel 10', 'Flame', 'from-orange-500 to-red-600', 'achievement', 10, 'xp'),
('legend', 'Lenda', 'Legend', 'Leyenda', 'Alcançou nível 15', 'Reached level 15', 'Alcanzó nivel 15', 'Trophy', 'from-yellow-400 to-amber-600', 'achievement', 15, 'xp');

-- Função para verificar e atribuir badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(new_badge_id UUID, badge_slug TEXT, badge_name TEXT) AS $$
DECLARE
  v_matches_count INTEGER;
  v_messages_count INTEGER;
  v_projects_count INTEGER;
  v_xp_level INTEGER;
  v_badge RECORD;
  v_metric_value INTEGER;
BEGIN
  -- Coleta métricas do usuário
  SELECT COUNT(*) INTO v_matches_count 
  FROM public.matches 
  WHERE (requester_id = p_user_id OR target_id = p_user_id) AND status = 'ACCEPTED';
  
  SELECT COUNT(*) INTO v_messages_count 
  FROM public.messages 
  WHERE sender_id = p_user_id;
  
  SELECT COUNT(*) INTO v_projects_count 
  FROM public.projects 
  WHERE owner_id = p_user_id;
  
  SELECT COALESCE(xp_level, 1) INTO v_xp_level 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Loop por todos os badges e verifica elegibilidade
  FOR v_badge IN SELECT * FROM public.badges LOOP
    -- Determina o valor da métrica
    CASE v_badge.metric
      WHEN 'matches' THEN v_metric_value := v_matches_count;
      WHEN 'messages' THEN v_metric_value := v_messages_count;
      WHEN 'projects' THEN v_metric_value := v_projects_count;
      WHEN 'xp' THEN v_metric_value := v_xp_level;
      ELSE v_metric_value := 0;
    END CASE;
    
    -- Verifica se atingiu o threshold
    IF v_metric_value >= v_badge.threshold THEN
      -- Tenta inserir o badge (ignora se já existe)
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      -- Se inseriu (badge novo), retorna
      IF FOUND THEN
        new_badge_id := v_badge.id;
        badge_slug := v_badge.slug;
        badge_name := v_badge.name;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para verificar badges após atualização de XP
CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_xp_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica badges quando XP level muda
  IF OLD.xp_level IS DISTINCT FROM NEW.xp_level THEN
    PERFORM public.check_and_award_badges(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_badges_after_profile_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_badges_on_xp_update();

-- Trigger para verificar badges após novo match aceito
CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACCEPTED' THEN
    PERFORM public.check_and_award_badges(NEW.requester_id);
    PERFORM public.check_and_award_badges(NEW.target_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_badges_after_match_update
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_badges_on_match();

-- Trigger para verificar badges após nova mensagem
CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.sender_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_badges_after_message_insert
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_badges_on_message();

-- Trigger para verificar badges após novo projeto
CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_project()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_badges_after_project_insert
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_badges_on_project();

-- Enable realtime para user_badges (para notificações em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;