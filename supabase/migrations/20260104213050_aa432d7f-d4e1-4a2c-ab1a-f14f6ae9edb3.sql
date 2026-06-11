-- Create table for onboarding events tracking
CREATE TABLE public.onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_type text NOT NULL,
  step_number integer NOT NULL,
  step_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  device_type text,
  referrer text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for analytics queries
CREATE INDEX idx_onboarding_events_user ON onboarding_events(user_id);
CREATE INDEX idx_onboarding_events_step ON onboarding_events(step_number, event_type);
CREATE INDEX idx_onboarding_events_created ON onboarding_events(created_at);
CREATE INDEX idx_onboarding_events_session ON onboarding_events(session_id);

-- Enable RLS
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events" ON onboarding_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own events
CREATE POLICY "Users can view own events" ON onboarding_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow anonymous inserts for users not yet logged in
CREATE POLICY "Allow anonymous inserts" ON onboarding_events
  FOR INSERT TO anon WITH CHECK (user_id IS NULL);