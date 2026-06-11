-- Create a function to reset deleted/archived flags when a new message arrives
CREATE OR REPLACE FUNCTION public.reset_conversation_deleted_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new message is inserted, reset the deleted and archived flags for both participants
  -- so the conversation reappears in their inbox
  UPDATE public.conversations
  SET 
    is_deleted_by_1 = CASE 
      WHEN participant_2 = NEW.sender_id THEN false 
      ELSE is_deleted_by_1 
    END,
    is_deleted_by_2 = CASE 
      WHEN participant_1 = NEW.sender_id THEN false 
      ELSE is_deleted_by_2 
    END,
    is_archived_by_1 = CASE 
      WHEN participant_2 = NEW.sender_id THEN false 
      ELSE is_archived_by_1 
    END,
    is_archived_by_2 = CASE 
      WHEN participant_1 = NEW.sender_id THEN false 
      ELSE is_archived_by_2 
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to fire after message insert
CREATE TRIGGER on_message_insert_reset_deleted
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.conversation_id IS NOT NULL)
  EXECUTE FUNCTION public.reset_conversation_deleted_on_new_message();