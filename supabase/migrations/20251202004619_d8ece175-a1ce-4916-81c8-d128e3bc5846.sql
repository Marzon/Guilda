-- Add source column to track signup origin
ALTER TABLE public.waitlist_signups 
ADD COLUMN source TEXT DEFAULT 'direct';

COMMENT ON COLUMN public.waitlist_signups.source IS 
'Origin tracking: direct, twitter, linkedin, whatsapp, copy';