-- Adicionar foreign key com ON DELETE CASCADE
-- Quando um perfil for deletado, o registro de banimento será automaticamente removido
ALTER TABLE public.banned_users
ADD CONSTRAINT banned_users_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;