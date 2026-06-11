-- Drop the existing check constraint
ALTER TABLE payment_receipts DROP CONSTRAINT IF EXISTS payment_receipts_product_type_check;

-- Recreate with all valid product types including founders_pass
ALTER TABLE payment_receipts ADD CONSTRAINT payment_receipts_product_type_check 
CHECK (product_type IN ('adventurer_pass', 'founder_pass', 'founders_pass', 'tavern_board'));