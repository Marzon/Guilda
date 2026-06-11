-- Create vouchers table
CREATE TABLE public.vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  tier subscription_tier NOT NULL,
  duration_months integer DEFAULT NULL, -- NULL = lifetime, number = months
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  used_at timestamp with time zone DEFAULT NULL,
  used_by uuid REFERENCES auth.users(id) DEFAULT NULL,
  expires_at timestamp with time zone DEFAULT NULL, -- voucher expiration (not subscription)
  notes text DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Admins can manage vouchers
CREATE POLICY "Admins can manage vouchers"
ON public.vouchers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can view and redeem available vouchers
CREATE POLICY "Users can view available vouchers by code"
ON public.vouchers
FOR SELECT
USING (auth.uid() IS NOT NULL AND used_by IS NULL);

-- Users can redeem vouchers (update used_by)
CREATE POLICY "Users can redeem vouchers"
ON public.vouchers
FOR UPDATE
USING (auth.uid() IS NOT NULL AND used_by IS NULL)
WITH CHECK (auth.uid() = used_by);

-- Create function to redeem voucher
CREATE OR REPLACE FUNCTION public.redeem_voucher(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_voucher RECORD;
  v_user_id uuid := auth.uid();
  v_expires_at timestamp with time zone;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Find and lock voucher
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE UPPER(code) = UPPER(p_code)
  FOR UPDATE;

  -- Check if voucher exists
  IF v_voucher IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code');
  END IF;

  -- Check if already used
  IF v_voucher.used_by IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_used');
  END IF;

  -- Check if voucher expired
  IF v_voucher.expires_at IS NOT NULL AND v_voucher.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'expired');
  END IF;

  -- Calculate subscription expiration
  IF v_voucher.duration_months IS NULL THEN
    v_expires_at := NULL; -- Lifetime
  ELSE
    v_expires_at := now() + (v_voucher.duration_months || ' months')::interval;
  END IF;

  -- Mark voucher as used
  UPDATE vouchers
  SET used_by = v_user_id, used_at = now()
  WHERE id = v_voucher.id;

  -- Update or create subscription
  INSERT INTO subscriptions (user_id, tier, expires_at, purchased_at)
  VALUES (v_user_id, v_voucher.tier, v_expires_at, now())
  ON CONFLICT (user_id) DO UPDATE
  SET tier = v_voucher.tier,
      expires_at = v_expires_at,
      purchased_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'tier', v_voucher.tier,
    'duration_months', v_voucher.duration_months
  );
END;
$$;