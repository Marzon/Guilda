-- Add action_url column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN action_url text;

COMMENT ON COLUMN public.notifications.action_url IS 
'URL para onde a notificação deve redirecionar ao ser clicada';