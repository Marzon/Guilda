-- Tabela para acumular notificações de email pendentes (digests)
CREATE TABLE public.pending_email_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  related_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  related_conversation_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Index para buscar digests pendentes
CREATE INDEX idx_pending_digests_user_pending ON pending_email_digests(user_id, processed_at) WHERE processed_at IS NULL;
CREATE INDEX idx_pending_digests_created ON pending_email_digests(created_at) WHERE processed_at IS NULL;

-- Tabela para controle de rate limiting de emails
CREATE TABLE public.email_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  last_sent_at timestamptz DEFAULT now(),
  count_today integer DEFAULT 1,
  reset_date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, email_type)
);

CREATE INDEX idx_email_rate_limits_lookup ON email_rate_limits(user_id, email_type);

-- Expandir preferências de email
ALTER TABLE public.email_preferences
ADD COLUMN IF NOT EXISTS message_frequency text DEFAULT 'digest' CHECK (message_frequency IN ('instant', 'digest', 'daily', 'never')),
ADD COLUMN IF NOT EXISTS digest_hour integer DEFAULT 18 CHECK (digest_hour >= 0 AND digest_hour <= 23),
ADD COLUMN IF NOT EXISTS quiet_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_mode_until timestamptz;

-- Adicionar tracking de abertura/clique em notificações
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS email_opened_at timestamptz,
ADD COLUMN IF NOT EXISTS email_clicked_at timestamptz;

-- RLS para pending_email_digests
ALTER TABLE public.pending_email_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending digests"
ON public.pending_email_digests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all digests"
ON public.pending_email_digests FOR ALL
USING (true)
WITH CHECK (true);

-- RLS para email_rate_limits
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
ON public.email_rate_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all rate limits"
ON public.email_rate_limits FOR ALL
USING (true)
WITH CHECK (true);