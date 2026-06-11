-- Create profile_reactions table
CREATE TABLE public.profile_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reactor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reactor_id, target_id, emoji)
);

-- Enable RLS
ALTER TABLE public.profile_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view all reactions (for counting)
CREATE POLICY "Anyone authenticated can view reactions"
ON public.profile_reactions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can add their own reactions
CREATE POLICY "Users can add their own reactions"
ON public.profile_reactions
FOR INSERT
WITH CHECK (auth.uid() = reactor_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.profile_reactions
FOR DELETE
USING (auth.uid() = reactor_id);

-- Create index for fast lookups
CREATE INDEX idx_profile_reactions_target ON public.profile_reactions(target_id);
CREATE INDEX idx_profile_reactions_reactor ON public.profile_reactions(reactor_id);