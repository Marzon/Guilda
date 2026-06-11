-- Adicionar FK para profiles (requester)
ALTER TABLE public.showcase_requests
ADD CONSTRAINT showcase_requests_requester_id_fkey
FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Adicionar FK para profiles (reviewer)
ALTER TABLE public.showcase_requests
ADD CONSTRAINT showcase_requests_reviewer_id_fkey
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;