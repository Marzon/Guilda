-- Criar tabela para armazenar comprovantes de pagamento PIX
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('founder_pass', 'tavern_board')),
  receipt_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reviewing')),
  rejection_reason TEXT,
  
  -- Dados extraídos do comprovante pela IA
  extracted_amount DECIMAL(10,2),
  extracted_transaction_id TEXT,
  extracted_date TIMESTAMP WITH TIME ZONE,
  extracted_pix_key TEXT,
  ai_confidence DECIMAL(3,2), -- 0.00 a 1.00
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT -- 'ai' ou admin_user_id
);

-- Criar tabela para evitar reutilização de comprovantes
CREATE TABLE IF NOT EXISTS public.used_transactions (
  transaction_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_receipt_id UUID REFERENCES public.payment_receipts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações de PIX (chaves PIX por produto)
CREATE TABLE IF NOT EXISTS public.pix_config (
  product_type TEXT PRIMARY KEY CHECK (product_type IN ('founder_pass', 'tavern_board')),
  pix_key TEXT NOT NULL,
  expected_amount DECIMAL(10,2) NOT NULL,
  qr_code_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão (você pode atualizar depois)
INSERT INTO public.pix_config (product_type, pix_key, expected_amount) VALUES
  ('founder_pass', 'sua-chave-pix-founders@email.com', 97.00),
  ('tavern_board', 'sua-chave-pix-tavern@email.com', 19.90)
ON CONFLICT (product_type) DO NOTHING;

-- Enable RLS
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies para payment_receipts
CREATE POLICY "Users can view their own receipts"
  ON public.payment_receipts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
  ON public.payment_receipts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending receipts"
  ON public.payment_receipts
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies para used_transactions
CREATE POLICY "Users can view their own used transactions"
  ON public.used_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies para pix_config (público para leitura)
CREATE POLICY "Anyone can view pix config"
  ON public.pix_config
  FOR SELECT
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX idx_payment_receipts_user_id ON public.payment_receipts(user_id);
CREATE INDEX idx_payment_receipts_status ON public.payment_receipts(status);
CREATE INDEX idx_used_transactions_user_id ON public.used_transactions(user_id);

-- Trigger para atualizar updated_at em pix_config
CREATE OR REPLACE FUNCTION public.update_pix_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_pix_config_updated_at
  BEFORE UPDATE ON public.pix_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pix_config_updated_at();