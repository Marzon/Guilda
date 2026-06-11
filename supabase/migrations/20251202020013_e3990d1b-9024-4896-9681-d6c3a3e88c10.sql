-- Create enums for member and invite status
CREATE TYPE member_status AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');
CREATE TYPE invite_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- Create project_roles table
CREATE TABLE public.project_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  role_description TEXT,
  required_archetype archetype,
  required_skills TEXT[] DEFAULT '{}',
  is_filled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.project_roles(id) ON DELETE SET NULL,
  status member_status DEFAULT 'ACTIVE',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create project_invites table
CREATE TABLE public.project_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.project_roles(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id),
  invitee_id UUID NOT NULL REFERENCES public.profiles(id),
  status invite_status DEFAULT 'PENDING',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(project_id, role_id, invitee_id)
);

-- Add columns to projects table
ALTER TABLE public.projects 
ADD COLUMN cover_image_url TEXT,
ADD COLUMN is_recruiting BOOLEAN DEFAULT TRUE,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on new tables
ALTER TABLE public.project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_roles
CREATE POLICY "Anyone can view project roles"
  ON public.project_roles FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage roles"
  ON public.project_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- RLS Policies for project_members
CREATE POLICY "Anyone can view project members"
  ON public.project_members FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage members"
  ON public.project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join projects (via accepted invites)"
  ON public.project_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for project_invites
CREATE POLICY "Users can view invites they sent or received"
  ON public.project_invites FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Project owners can send invites"
  ON public.project_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_invites.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invites"
  ON public.project_invites FOR UPDATE
  USING (auth.uid() = invitee_id);

-- Trigger to update updated_at on projects
CREATE OR REPLACE FUNCTION public.update_project_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_project_updated_at();