-- Drop the existing check constraint and recreate it with adventurer_pass included
ALTER TABLE public.payment_receipts DROP CONSTRAINT IF EXISTS payment_receipts_product_type_check;

ALTER TABLE public.payment_receipts ADD CONSTRAINT payment_receipts_product_type_check 
CHECK (product_type IN ('founder_pass', 'adventurer_pass', 'tavern_board'));