-- Create cohort_videos table for batch managers to upload videos per day
CREATE TABLE public.cohort_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- 0 = welcome/intro, 1-15 = daily, 16 = post-pivoter/final
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, day_number)
);

-- Create cohort_video_views table to track founder video views
CREATE TABLE public.cohort_video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.cohort_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration_seconds INTEGER, -- optional: how long they watched
  completed BOOLEAN DEFAULT false, -- did they watch the whole thing?
  UNIQUE(video_id, user_id)
);

-- Enable RLS
ALTER TABLE public.cohort_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_video_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for cohort_videos
-- Allow admins and batch managers to manage videos
CREATE POLICY "Admins and batch managers can manage cohort videos"
ON public.cohort_videos
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  OR 
  EXISTS (SELECT 1 FROM public.cohort_managers WHERE user_id = auth.uid() AND cohort_id = cohort_videos.cohort_id)
);

-- Allow enrolled users to view videos for their cohort
CREATE POLICY "Enrolled users can view cohort videos"
ON public.cohort_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.acceleration_user_progress 
    WHERE user_id = auth.uid() 
    AND cohort_id = cohort_videos.cohort_id
  )
);

-- RLS policies for cohort_video_views
-- Users can view and create their own view records
CREATE POLICY "Users can manage their own video views"
ON public.cohort_video_views
FOR ALL
USING (user_id = auth.uid());

-- Admins and batch managers can view all video views for analytics
CREATE POLICY "Admins and batch managers can view all video views"
ON public.cohort_video_views
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  OR 
  EXISTS (
    SELECT 1 FROM public.cohort_managers cm
    JOIN public.cohort_videos cv ON cv.cohort_id = cm.cohort_id
    WHERE cm.user_id = auth.uid() AND cv.id = cohort_video_views.video_id
  )
);

-- Create trigger for updated_at on cohort_videos
CREATE TRIGGER update_cohort_videos_updated_at
BEFORE UPDATE ON public.cohort_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();