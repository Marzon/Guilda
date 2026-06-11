-- Create success_stories table for tracking confirmed partnerships
CREATE TABLE public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships (optional - can be manual entry)
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.project_applications(id) ON DELETE SET NULL,
  
  -- Participants (required)
  founder_1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  founder_2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Content
  partnership_type TEXT CHECK (partnership_type IN ('cofounder', 'contractor', 'advisor', 'investor', 'other')),
  testimonial_1 TEXT, -- Testimonial from founder 1
  testimonial_2 TEXT, -- Testimonial from founder 2
  result_summary TEXT, -- Admin-edited summary for public display
  
  -- Confirmation tracking
  confirmed_by_founder_1 BOOLEAN DEFAULT false,
  confirmed_by_founder_2 BOOLEAN DEFAULT false,
  confirmation_token_1 TEXT UNIQUE,
  confirmation_token_2 TEXT UNIQUE,
  
  -- Status and visibility
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'confirmed', 'featured', 'rejected')),
  is_public BOOLEAN DEFAULT false,
  featured_order INT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  follow_up_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin can do everything
CREATE POLICY "Admin full access to success_stories"
ON public.success_stories
FOR ALL
USING (auth.uid() = 'f14d6435-6eb7-4585-8146-ef9f3e29c2c1'::uuid);

-- Founders can view their own stories
CREATE POLICY "Founders can view their own success stories"
ON public.success_stories
FOR SELECT
USING (auth.uid() = founder_1_id OR auth.uid() = founder_2_id);

-- Founders can update their own testimonial
CREATE POLICY "Founders can update their own story"
ON public.success_stories
FOR UPDATE
USING (auth.uid() = founder_1_id OR auth.uid() = founder_2_id)
WITH CHECK (auth.uid() = founder_1_id OR auth.uid() = founder_2_id);

-- Public can view featured/public stories
CREATE POLICY "Anyone can view public featured stories"
ON public.success_stories
FOR SELECT
USING (is_public = true AND status = 'featured');

-- Create index for featured stories query
CREATE INDEX idx_success_stories_featured ON public.success_stories(featured_order) WHERE status = 'featured' AND is_public = true;

-- Create index for follow-up queries
CREATE INDEX idx_success_stories_followup ON public.success_stories(follow_up_sent_at) WHERE status = 'pending';

-- Create index for token lookups
CREATE INDEX idx_success_stories_token_1 ON public.success_stories(confirmation_token_1) WHERE confirmation_token_1 IS NOT NULL;
CREATE INDEX idx_success_stories_token_2 ON public.success_stories(confirmation_token_2) WHERE confirmation_token_2 IS NOT NULL;