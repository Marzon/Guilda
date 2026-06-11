-- =====================================================
-- FASE 1: Sistema de Apresentação de Founders
-- Tabelas para chat em grupo e introduções
-- =====================================================

-- 1. Tabela de conversas em grupo
CREATE TABLE public.group_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, -- Nome opcional do grupo
  type TEXT NOT NULL DEFAULT 'INTRODUCTION', -- INTRODUCTION, GENERAL
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  role_id UUID REFERENCES public.project_roles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

-- 2. Tabela de membros das conversas em grupo
CREATE TABLE public.group_conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'MEMBER', -- INTRODUCER, INTRODUCED, RECIPIENT, MEMBER
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- 3. Tabela de introduções de founders
CREATE TABLE public.founder_introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id UUID NOT NULL REFERENCES public.profiles(id), -- B (quem apresenta)
  introduced_id UUID NOT NULL REFERENCES public.profiles(id), -- C (apresentado)
  recipient_id UUID NOT NULL REFERENCES public.profiles(id), -- A (recebe apresentação)
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- Opcional
  role_id UUID REFERENCES public.project_roles(id) ON DELETE SET NULL, -- Opcional
  group_conversation_id UUID REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  message TEXT, -- Mensagem de introdução
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Adicionar coluna group_conversation_id na tabela messages
ALTER TABLE public.messages 
ADD COLUMN group_conversation_id UUID REFERENCES public.group_conversations(id) ON DELETE CASCADE;

-- 5. Habilitar RLS em todas as tabelas
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_introductions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: group_conversations
-- =====================================================

-- Membros podem ver suas conversas em grupo
CREATE POLICY "Members can view their group conversations"
ON public.group_conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_conversation_members
    WHERE conversation_id = group_conversations.id
    AND user_id = auth.uid()
  )
);

-- Usuários autenticados podem criar conversas em grupo
CREATE POLICY "Authenticated users can create group conversations"
ON public.group_conversations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Criador pode atualizar a conversa (ex: last_message_at)
CREATE POLICY "Members can update their group conversations"
ON public.group_conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_conversation_members
    WHERE conversation_id = group_conversations.id
    AND user_id = auth.uid()
  )
);

-- Criador pode deletar a conversa
CREATE POLICY "Creator can delete group conversation"
ON public.group_conversations
FOR DELETE
USING (auth.uid() = created_by);

-- =====================================================
-- RLS POLICIES: group_conversation_members
-- =====================================================

-- Membros podem ver participantes de suas conversas
CREATE POLICY "Members can view participants of their conversations"
ON public.group_conversation_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_conversation_members AS gcm
    WHERE gcm.conversation_id = group_conversation_members.conversation_id
    AND gcm.user_id = auth.uid()
  )
);

-- Criador da conversa pode adicionar membros
CREATE POLICY "Conversation creator can add members"
ON public.group_conversation_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_conversations
    WHERE id = conversation_id
    AND created_by = auth.uid()
  )
);

-- Membros podem atualizar seu próprio registro (ex: is_archived)
CREATE POLICY "Members can update their own membership"
ON public.group_conversation_members
FOR UPDATE
USING (auth.uid() = user_id);

-- Criador pode remover membros
CREATE POLICY "Conversation creator can remove members"
ON public.group_conversation_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.group_conversations
    WHERE id = conversation_id
    AND created_by = auth.uid()
  )
);

-- =====================================================
-- RLS POLICIES: founder_introductions
-- =====================================================

-- Participantes podem ver suas introduções
CREATE POLICY "Participants can view their introductions"
ON public.founder_introductions
FOR SELECT
USING (
  auth.uid() = introducer_id OR
  auth.uid() = introduced_id OR
  auth.uid() = recipient_id
);

-- Usuários autenticados podem criar introduções
CREATE POLICY "Authenticated users can create introductions"
ON public.founder_introductions
FOR INSERT
WITH CHECK (auth.uid() = introducer_id);

-- Participantes podem atualizar status
CREATE POLICY "Participants can update introduction status"
ON public.founder_introductions
FOR UPDATE
USING (
  auth.uid() = introducer_id OR
  auth.uid() = introduced_id OR
  auth.uid() = recipient_id
);

-- =====================================================
-- RLS POLICIES: messages (adicionar para group_conversation_id)
-- =====================================================

-- Membros podem ver mensagens de suas conversas em grupo
CREATE POLICY "Users can view messages in their group conversations"
ON public.messages
FOR SELECT
USING (
  group_conversation_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.group_conversation_members
    WHERE conversation_id = messages.group_conversation_id
    AND user_id = auth.uid()
  )
);

-- Membros podem enviar mensagens em suas conversas em grupo
CREATE POLICY "Users can send messages in their group conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  group_conversation_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.group_conversation_members
    WHERE conversation_id = messages.group_conversation_id
    AND user_id = auth.uid()
  )
);

-- Membros podem deletar suas próprias mensagens em grupos
CREATE POLICY "Users can delete their messages in group conversations"
ON public.messages
FOR DELETE
USING (
  group_conversation_id IS NOT NULL AND
  sender_id = auth.uid()
);

-- =====================================================
-- TRIGGER: Atualizar last_message_at em group_conversations
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_group_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.group_conversation_id IS NOT NULL THEN
    UPDATE group_conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.group_conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_group_message_insert
AFTER INSERT ON public.messages
FOR EACH ROW
WHEN (NEW.group_conversation_id IS NOT NULL)
EXECUTE FUNCTION public.update_group_conversation_last_message();

-- =====================================================
-- INDEX: Melhorar performance de queries
-- =====================================================

CREATE INDEX idx_group_conversation_members_user_id 
ON public.group_conversation_members(user_id);

CREATE INDEX idx_group_conversation_members_conversation_id 
ON public.group_conversation_members(conversation_id);

CREATE INDEX idx_founder_introductions_introducer 
ON public.founder_introductions(introducer_id);

CREATE INDEX idx_founder_introductions_introduced 
ON public.founder_introductions(introduced_id);

CREATE INDEX idx_founder_introductions_recipient 
ON public.founder_introductions(recipient_id);

CREATE INDEX idx_messages_group_conversation_id 
ON public.messages(group_conversation_id);

-- =====================================================
-- ENABLE REALTIME: Para atualizações em tempo real
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.founder_introductions;