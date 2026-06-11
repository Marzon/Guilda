-- Create enums for new features
CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE link_type AS ENUM ('GITHUB', 'WEBSITE', 'PITCH', 'LINKEDIN', 'TWITTER', 'FIGMA', 'OTHER');
CREATE TYPE update_type AS ENUM ('MILESTONE', 'ANNOUNCEMENT', 'HIRING', 'GENERAL');

-- 1. Project Applications (Candidaturas)
CREATE TABLE project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status application_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(role_id, applicant_id)
);

ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON project_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Users can apply to projects" ON project_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can withdraw applications" ON project_applications
  FOR UPDATE USING (auth.uid() = applicant_id);

CREATE POLICY "Owners can view project applications" ON project_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_applications.project_id 
    AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Owners can respond to applications" ON project_applications
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_applications.project_id 
    AND projects.owner_id = auth.uid()
  ));

-- 2. Project Favorites
CREATE TABLE project_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON project_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view favorites count" ON project_favorites
  FOR SELECT USING (true);

-- 3. Tags System
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO tags (name, color) VALUES
  ('SaaS', '#8B5CF6'),
  ('Fintech', '#10B981'),
  ('E-commerce', '#F59E0B'),
  ('HealthTech', '#EF4444'),
  ('EdTech', '#3B82F6'),
  ('Marketplace', '#EC4899'),
  ('Social', '#6366F1'),
  ('AI/ML', '#14B8A6'),
  ('Gaming', '#F97316'),
  ('B2B', '#6B7280'),
  ('B2C', '#84CC16'),
  ('Mobile', '#A855F7');

CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(project_id, tag_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view project tags" ON project_tags FOR SELECT USING (true);
CREATE POLICY "Owners can manage project tags" ON project_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_tags.project_id 
    AND projects.owner_id = auth.uid()
  ));

-- 4. Project Links
CREATE TABLE project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type link_type NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project links" ON project_links FOR SELECT USING (true);
CREATE POLICY "Owners can manage links" ON project_links
  FOR ALL USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_links.project_id 
    AND projects.owner_id = auth.uid()
  ));

-- 5. Project Updates (Timeline)
CREATE TABLE project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type update_type DEFAULT 'GENERAL',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project updates" ON project_updates FOR SELECT USING (true);
CREATE POLICY "Project team can post updates" ON project_updates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_updates.project_id AND projects.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM project_members WHERE project_members.project_id = project_updates.project_id AND project_members.user_id = auth.uid() AND project_members.status = 'ACTIVE')
  );