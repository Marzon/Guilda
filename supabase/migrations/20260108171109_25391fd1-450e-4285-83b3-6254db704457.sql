-- Insert investor-specific skills
INSERT INTO skills (id, name, category, icon) VALUES
  (gen_random_uuid(), 'Anjo', 'investor', 'heart'),
  (gen_random_uuid(), 'Pre-seed', 'investor', 'seedling'),
  (gen_random_uuid(), 'Seed', 'investor', 'sprout'),
  (gen_random_uuid(), 'Series A+', 'investor', 'trending-up'),
  (gen_random_uuid(), 'Venture Capital', 'investor', 'landmark'),
  (gen_random_uuid(), 'Corporate VC', 'investor', 'building-2'),
  (gen_random_uuid(), 'HealthTech', 'investor', 'heart-pulse'),
  (gen_random_uuid(), 'FinTech', 'investor', 'wallet'),
  (gen_random_uuid(), 'EdTech', 'investor', 'graduation-cap'),
  (gen_random_uuid(), 'B2B SaaS', 'investor', 'building'),
  (gen_random_uuid(), 'Marketplace', 'investor', 'store'),
  (gen_random_uuid(), 'Deep Tech', 'investor', 'cpu'),
  (gen_random_uuid(), 'Climate Tech', 'investor', 'leaf'),
  (gen_random_uuid(), 'Impacto Social', 'investor', 'users');