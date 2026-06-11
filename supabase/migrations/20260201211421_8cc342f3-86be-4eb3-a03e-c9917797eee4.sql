-- Create tour_events table for tracking tour interactions
CREATE TABLE public.tour_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  step_number INTEGER DEFAULT 0,
  step_name TEXT,
  event_data JSONB DEFAULT '{}',
  device_type TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for analytical queries
CREATE INDEX idx_tour_events_tour_name ON tour_events(tour_name);
CREATE INDEX idx_tour_events_event_type ON tour_events(event_type);
CREATE INDEX idx_tour_events_created_at ON tour_events(created_at);
CREATE INDEX idx_tour_events_user_id ON tour_events(user_id);
CREATE INDEX idx_tour_events_session ON tour_events(session_id);

-- Enable RLS
ALTER TABLE tour_events ENABLE ROW LEVEL SECURITY;

-- Allow insert for all users (authenticated and anonymous)
CREATE POLICY "Allow insert for all users" ON tour_events
  FOR INSERT WITH CHECK (true);

-- Allow read only for admins
CREATE POLICY "Allow read for admins" ON tour_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Enable realtime for dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE tour_events;