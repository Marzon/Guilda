-- Insert the 3 success stories with confirmation tokens
INSERT INTO success_stories (
  founder_1_id, 
  founder_2_id, 
  project_id, 
  confirmation_token_1, 
  confirmation_token_2,
  result_summary, 
  status, 
  partnership_type,
  is_public
) VALUES 
-- ObraControl: neivam_carvalho (SELLER) + micael_garcez (BUILDER)
(
  '30d1064b-2c8e-4f55-b2ea-f3ab0fceb4b8', 
  '33f74039-1b45-4d9b-a269-d2578726d915', 
  'bcac01a6-325a-4a01-a888-3027293f054e',
  encode(gen_random_bytes(32), 'hex'), 
  encode(gen_random_bytes(32), 'hex'),
  'Encontramos o co-founder técnico ideal para o ObraControl através da Guilda', 
  'pending', 
  'cofounder',
  false
),
-- Linkops: Malkaviano (BUILDER) + alisson_reis (SELLER)  
(
  '09294d86-8973-4afc-949c-76e22aa10317', 
  'ff83a101-6019-4cb7-9817-4277618d3c6d',
  '5431e1af-9e9e-41a6-9179-1c60f33234c4',
  encode(gen_random_bytes(32), 'hex'), 
  encode(gen_random_bytes(32), 'hex'),
  'Parceria estratégica de growth para a Linkops formada na Guilda', 
  'pending', 
  'cofounder',
  false
),
-- Pulakatraca: henrico (BUILDER) + italoiz (BUILDER)
(
  '30908f5d-b671-4167-a8f9-c1c497b543bb', 
  'ec9dac6e-1214-41a8-a8ed-77f3381353dc',
  '6a33d192-7a77-4467-b9d1-3feee095be9b',
  encode(gen_random_bytes(32), 'hex'), 
  encode(gen_random_bytes(32), 'hex'),
  'Co-fundadores técnicos construindo a Pulakatraca juntos na Guilda', 
  'pending', 
  'cofounder',
  false
);