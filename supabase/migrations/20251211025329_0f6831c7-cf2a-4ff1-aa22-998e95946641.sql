-- Add looking_for and offering columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS looking_for TEXT,
ADD COLUMN IF NOT EXISTS offering TEXT;

-- Populate existing profiles based on archetype
UPDATE profiles 
SET 
  looking_for = CASE 
    WHEN archetype = 'BUILDER' THEN 'CMO / Growth / Comercial'
    WHEN archetype = 'SELLER' THEN 'CTO / Dev / Product'
  END,
  offering = CASE 
    WHEN archetype = 'BUILDER' THEN 'Desenvolvimento / Produto / Tech'
    WHEN archetype = 'SELLER' THEN 'Marketing / Vendas / Growth'
  END
WHERE looking_for IS NULL OR offering IS NULL;