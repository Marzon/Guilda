-- Add read_at column to messages table for WhatsApp-style read receipts
ALTER TABLE public.messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on read status
CREATE INDEX idx_messages_read_at ON public.messages(match_id, read_at);

-- Function to mark all messages in a match as read by a specific user
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_match_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE match_id = p_match_id
    AND sender_id != p_user_id
    AND read_at IS NULL;
END;
$$;