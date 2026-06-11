-- Remove the existing check constraint and add a new one that includes founders_pass
ALTER TABLE pix_config DROP CONSTRAINT IF EXISTS pix_config_product_type_check;

ALTER TABLE pix_config ADD CONSTRAINT pix_config_product_type_check 
CHECK (product_type IN ('adventurer_pass', 'founder_pass', 'tavern_board', 'founders_pass'));