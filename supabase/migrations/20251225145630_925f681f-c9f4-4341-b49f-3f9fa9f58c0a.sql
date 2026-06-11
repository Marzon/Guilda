-- 1. Recreate profile_boosts table for Tavern Board feature
CREATE TABLE IF NOT EXISTS public.profile_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  paypal_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profile_boosts ENABLE ROW LEVEL SECURITY;

-- Users can view their own boosts
CREATE POLICY "Users can view their own boosts"
ON public.profile_boosts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own boosts (via edge function with service role)
CREATE POLICY "Service role can manage boosts"
ON public.profile_boosts
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Create FREE subscriptions for orphaned users (users without subscription record)
INSERT INTO public.subscriptions (user_id, tier)
SELECT p.id, 'FREE'::subscription_tier
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;