-- Adicionar coluna para referência à mensagem sendo respondida
ALTER TABLE public.messages 
ADD COLUMN reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- Índice para performance ao buscar replies
CREATE INDEX idx_messages_reply_to_id ON public.messages(reply_to_id);