-- Create skill category enum
CREATE TYPE skill_category AS ENUM ('tech', 'design', 'business');

-- Create skills table (master list)
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category skill_category NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_skills table (junction with proficiency)
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Skills are viewable by everyone
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);

-- User skills policies
CREATE POLICY "Anyone can view user skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_skills_category ON public.skills(category);

-- Insert default skills
INSERT INTO public.skills (name, category, icon) VALUES
-- Tech skills
('React', 'tech', 'code'),
('Node.js', 'tech', 'server'),
('Python', 'tech', 'code'),
('TypeScript', 'tech', 'code'),
('PostgreSQL', 'tech', 'database'),
('AWS', 'tech', 'cloud'),
('Docker', 'tech', 'box'),
('Mobile Dev', 'tech', 'smartphone'),
('Machine Learning', 'tech', 'brain'),
('DevOps', 'tech', 'settings'),
-- Design skills
('UI Design', 'design', 'palette'),
('UX Research', 'design', 'search'),
('Figma', 'design', 'figma'),
('Branding', 'design', 'sparkles'),
('Motion Design', 'design', 'play'),
('3D Design', 'design', 'box'),
('Illustration', 'design', 'pen-tool'),
('Product Design', 'design', 'layout'),
-- Business skills
('Marketing', 'business', 'megaphone'),
('Sales', 'business', 'trending-up'),
('Growth Hacking', 'business', 'rocket'),
('SEO', 'business', 'search'),
('Content Strategy', 'business', 'file-text'),
('Product Management', 'business', 'clipboard'),
('Finance', 'business', 'dollar-sign'),
('Legal', 'business', 'scale'),
('HR', 'business', 'users'),
('Analytics', 'business', 'bar-chart');