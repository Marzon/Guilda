-- Create table to track which projects a user has viewed
CREATE TABLE public.project_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own project views
CREATE POLICY "Users can view their own project views"
ON public.project_views
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own project views
CREATE POLICY "Users can insert their own project views"
ON public.project_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own project views (to update viewed_at)
CREATE POLICY "Users can update their own project views"
ON public.project_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_project_views_user_id ON public.project_views(user_id);
CREATE INDEX idx_project_views_project_id ON public.project_views(project_id);