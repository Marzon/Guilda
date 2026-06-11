-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'match_request', 'match_accepted', 'new_message', 'daily_summary'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  related_match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_email BOOLEAN DEFAULT FALSE,
  sent_push BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text OR auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to count unread messages per match
CREATE OR REPLACE FUNCTION public.count_unread_messages(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT m.match_id) INTO unread_count
  FROM messages m
  JOIN matches mt ON m.match_id = mt.id
  WHERE (mt.requester_id = p_user_id OR mt.target_id = p_user_id)
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM messages m2
      WHERE m2.match_id = m.match_id
        AND m2.sender_id = p_user_id
        AND m2.created_at > m.created_at
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Function to mark messages as read for a match
CREATE OR REPLACE FUNCTION public.mark_match_as_read(p_match_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Just a placeholder function - actual "read" status is tracked by checking if user sent a message after
  -- This is used to trigger notifications update
  RETURN;
END;
$$;