-- Create table to store founder guide progress
CREATE TABLE public.founder_guide_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_items TEXT[] NOT NULL DEFAULT '{}',
  manually_completed TEXT[] NOT NULL DEFAULT '{}',
  has_seen_guide BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT founder_guide_progress_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.founder_guide_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own progress" 
ON public.founder_guide_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.founder_guide_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.founder_guide_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_founder_guide_progress_updated_at
BEFORE UPDATE ON public.founder_guide_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_founder_guide_progress_user_id ON public.founder_guide_progress(user_id);