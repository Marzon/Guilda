-- Add column to track PWA installation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_pwa_installed boolean DEFAULT false;

-- Insert PWA installed badge
INSERT INTO badges (slug, name, name_en, name_es, description, description_en, description_es, icon, color, category, threshold, metric)
VALUES (
  'pwa_installed',
  'App Instalado',
  'App Installed',
  'App Instalado',
  'Instalou o app da Guilda no celular',
  'Installed the Guilda app on mobile',
  'Instaló la app de Guilda en el móvil',
  'Smartphone',
  'from-indigo-500 to-purple-600',
  'achievement',
  1,
  'pwa_installed'
) ON CONFLICT (slug) DO NOTHING;