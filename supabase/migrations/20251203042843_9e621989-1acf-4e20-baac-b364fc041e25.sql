
-- Atualizar RLS de projects para permitir leitura pública (visitantes não logados)
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;

CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Também permitir leitura pública de project_roles para mostrar vagas
DROP POLICY IF EXISTS "Anyone can view project roles" ON public.project_roles;

CREATE POLICY "Anyone can view project roles" 
ON public.project_roles 
FOR SELECT 
USING (true);

-- E profiles para mostrar avatar/nome do owner
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);
